const GOAL_STATUS = {
  ACTIVE: "active",
  ACHIEVED: "achieved",
  BLOCKED: "blocked",
  CLEARED: "cleared",
}

const CLEAR_COMMANDS = new Set(["clear", "stop", "reset", "cancel"])
const STATUS_COMMANDS = new Set(["status"])
const RESUME_COMMANDS = new Set(["resume"])

const DEFAULT_LIMITS = {
  maxContinuations: 10,
  maxElapsedMs: 30 * 60 * 1000,
  maxRepeatedNoProgress: 3,
}

const EVALUATOR_DISABLED_TOOLS = {
  bash: false,
  edit: false,
  glob: false,
  grep: false,
  list: false,
  read: false,
  task: false,
  todowrite: false,
  webfetch: false,
}

const states = new Map()

const now = () => new Date().toISOString()

const positiveInteger = (value, fallback) => {
  return Number.isInteger(value) && value > 0 ? value : fallback
}

const normalizeCommandName = (value) => {
  return typeof value === "string" && value.trim() ? value.trim().replace(/^\/+/, "") : "goal"
}

const modelFromString = (model) => {
  if (typeof model !== "string") return undefined

  const slash = model.indexOf("/")
  if (slash <= 0 || slash === model.length - 1) return undefined

  return {
    providerID: model.slice(0, slash),
    modelID: model.slice(slash + 1),
  }
}

const textPart = (text) => ({ type: "text", text })

// OpenCode currently passes the original parts array on to the prompt path, so
// command hooks must mutate that array rather than assign output.parts anew.
const replaceParts = (output, parts) => {
  output.parts.splice(0, output.parts.length, ...parts)
}

const partText = (part) => {
  if (!part) return ""
  if (typeof part.text === "string") return part.text
  if (typeof part.content === "string") return part.content
  if (typeof part.message === "string") return part.message
  return ""
}

const responseText = (response) => {
  const data = response?.data || response
  if (!data) return ""
  if (typeof data === "string") return data
  if (Array.isArray(data.parts)) return data.parts.map(partText).filter(Boolean).join("\n")
  if (data.info?.text) return data.info.text
  return ""
}

const messageID = (message) => message?.info?.id || message?.id

const latestMessageID = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const id = messageID(messages[i])
    if (id) return id
  }
  return undefined
}

const transcriptText = (messages) => {
  return messages
    .slice(-30)
    .map((message) => {
      const role = message?.info?.role || message?.role || "message"
      const text = Array.isArray(message?.parts) ? message.parts.map(partText).filter(Boolean).join("\n") : ""
      return text ? `[${role}]\n${text}` : ""
    })
    .filter(Boolean)
    .join("\n\n")
}

const isIdleEvent = (event) => {
  return event?.type === "session.idle" || (event?.type === "session.status" && event?.properties?.status?.type === "idle")
}

const sessionIDFromEvent = (input) => {
  const event = input?.event || input
  return (
    event?.properties?.sessionID ||
    event?.properties?.info?.sessionID ||
    event?.properties?.sessionId ||
    event?.properties?.session?.id ||
    event?.sessionID ||
    event?.sessionId ||
    event?.session?.id
  )
}

const createGoalState = (condition) => ({
  condition,
  status: GOAL_STATUS.ACTIVE,
  startedAt: now(),
  updatedAt: now(),
  continuationCount: 0,
  latestReason: "Goal set.",
  latestEvidence: [],
  latestNextAction: condition,
  inFlight: false,
  lastProcessedMessageID: undefined,
  repeatedNoProgressCount: 0,
  lastProgressFingerprint: undefined,
  suppressNextIdle: false,
  ignoreNextUserMessage: false,
})

const touch = (state) => {
  state.updatedAt = now()
}

const suppressCommandSideEffects = (state) => {
  if (!state) return
  state.suppressNextIdle = true
  state.ignoreNextUserMessage = true
}

const progressFingerprint = (evaluation) => {
  return [evaluation.status, evaluation.reason, evaluation.next_action].join("\n").toLowerCase().trim()
}

const parseEvaluation = (text) => {
  const trimmed = text.trim()
  const jsonText = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || trimmed.match(/\{[\s\S]*\}/)?.[0]
  if (!jsonText) throw new Error("Evaluator did not return JSON.")

  const parsed = JSON.parse(jsonText)
  const status = ["complete", "continue", "blocked"].includes(parsed.status) ? parsed.status : "blocked"
  const evidence = Array.isArray(parsed.evidence) ? parsed.evidence.map(String) : []

  return {
    status,
    reason: String(parsed.reason || "No reason provided."),
    evidence,
    next_action: String(parsed.next_action || "No next action provided."),
  }
}

export const GoalPlugin = async ({ client }, options = {}) => {
  const limits = {
    maxContinuations: positiveInteger(options.maxContinuations, DEFAULT_LIMITS.maxContinuations),
    maxElapsedMs: positiveInteger(options.maxElapsedMs, DEFAULT_LIMITS.maxElapsedMs),
    maxRepeatedNoProgress: positiveInteger(options.maxRepeatedNoProgress, DEFAULT_LIMITS.maxRepeatedNoProgress),
  }

  const commandName = normalizeCommandName(options.commandName)
  let evaluatorModel = modelFromString(options.evaluatorModel)

  const showToast = async (message, variant = "info") => {
    try {
      await client.tui.showToast({ body: { message, variant } })
    } catch {
      // Toast support is best-effort; the goal loop should not depend on the TUI.
    }
  }

  const getSessionMessages = async (sessionID) => {
    const response = await client.session.messages({ path: { id: sessionID } })
    return response.data || []
  }

  const createEvaluationSession = async () => {
    const response = await client.session.create({ body: { title: "Goal evaluation" } })
    return (response.data || response)?.id
  }

  const deleteEvaluationSession = async (sessionID) => {
    try {
      await client.session.delete({ path: { id: sessionID } })
    } catch {
      // Best-effort cleanup. A failed delete should not affect the user's goal loop.
    }
  }

  const formatState = (state) => {
    if (!state) return "No goal has been set for this session."

    const evidence = state.latestEvidence.length
      ? state.latestEvidence.map((item) => `- ${item}`).join("\n")
      : "- None recorded."

    return [
      `Goal status: ${state.status}`,
      `Condition: ${state.condition}`,
      `Started: ${state.startedAt}`,
      `Updated: ${state.updatedAt}`,
      `Continuations: ${state.continuationCount}/${limits.maxContinuations}`,
      `Latest reason: ${state.latestReason || "None recorded."}`,
      `Latest evidence:\n${evidence}`,
      `Latest next action: ${state.latestNextAction || "None recorded."}`,
    ].join("\n")
  }

  const commandResponsePrompt = (text) => {
    return `This is the result of the /${commandName} command. Reply with exactly the following text and do not perform any tools, checks, or additional work:\n\n${text}`
  }

  const startGoalPrompt = (state) => {
    return `An active goal has been set for this session.

Goal:
${state.condition}

Start working toward the goal now. Surface concrete evidence in your response or tool results so the goal evaluator can judge progress after this turn.`
  }

  const evaluatorPrompt = (state, messages) => {
    return `You are evaluating whether an OpenCode session goal is complete.

Return only JSON matching this shape:
{
  "status": "complete" | "continue" | "blocked",
  "reason": "short explanation",
  "evidence": ["specific evidence from the transcript"],
  "next_action": "the next concrete action if status is continue, otherwise empty or brief"
}

Rules:
- Judge only from the transcript below.
- Do not perform the work yourself.
- If the goal is demonstrably satisfied, use "complete".
- If more work can make progress, use "continue" and provide one concrete next_action.
- If progress appears blocked or no credible next action exists, use "blocked".
- Keep evidence short and quote only facts visible in the transcript.

Goal condition:
${state.condition}

Transcript:
${transcriptText(messages)}`
  }

  const continuationPrompt = (state) => {
    return `Continue working toward this active goal:

${state.condition}

Evaluator reason:
${state.latestReason}

Evaluator next action:
${state.latestNextAction}

Proceed with the next useful step. Surface evidence for progress so the goal evaluator can judge the result after this turn.`
  }

  const evaluateGoal = async (state, messages) => {
    const evaluationSessionID = await createEvaluationSession()
    if (!evaluationSessionID) throw new Error("Could not create evaluation session.")

    try {
      const response = await client.session.prompt({
        path: { id: evaluationSessionID },
        body: {
          ...(evaluatorModel ? { model: evaluatorModel } : {}),
          tools: EVALUATOR_DISABLED_TOOLS,
          parts: [{ type: "text", text: evaluatorPrompt(state, messages) }],
        },
      })

      return parseEvaluation(responseText(response))
    } finally {
      await deleteEvaluationSession(evaluationSessionID)
    }
  }

  const blockGoal = async (state, reason, evidence = [], nextAction = "") => {
    state.status = GOAL_STATUS.BLOCKED
    touch(state)
    state.latestReason = reason
    state.latestEvidence = evidence
    state.latestNextAction = nextAction
    await showToast(`Goal blocked: ${reason}`, "warning")
  }

  const budgetBlockReason = (state) => {
    if (state.continuationCount >= limits.maxContinuations) {
      return `Reached max continuations (${limits.maxContinuations}).`
    }

    const elapsed = Date.now() - Date.parse(state.startedAt)
    if (elapsed > limits.maxElapsedMs) {
      return `Reached max elapsed time (${Math.round(limits.maxElapsedMs / 60000)} minutes).`
    }

    if (state.repeatedNoProgressCount >= limits.maxRepeatedNoProgress) {
      return `Reached max repeated no-progress evaluations (${limits.maxRepeatedNoProgress}).`
    }

    return undefined
  }

  const applyEvaluation = async (state, evaluation) => {
    touch(state)
    state.latestReason = evaluation.reason
    state.latestEvidence = evaluation.evidence
    state.latestNextAction = evaluation.next_action

    if (evaluation.status === "complete") {
      state.status = GOAL_STATUS.ACHIEVED
      await showToast("Goal achieved", "success")
      return "stop"
    }

    if (evaluation.status === "blocked") {
      await blockGoal(state, evaluation.reason, evaluation.evidence, evaluation.next_action)
      return "stop"
    }

    const fingerprint = progressFingerprint(evaluation)
    if (fingerprint === state.lastProgressFingerprint) {
      state.repeatedNoProgressCount += 1
    } else {
      state.repeatedNoProgressCount = 0
      state.lastProgressFingerprint = fingerprint
    }

    return "continue"
  }

  const continueGoal = async (sessionID, state) => {
    state.continuationCount += 1
    state.ignoreNextUserMessage = true
    touch(state)

    await client.session.prompt({
      path: { id: sessionID },
      body: { parts: [{ type: "text", text: continuationPrompt(state) }] },
    })
  }

  const handleIdle = async (sessionID) => {
    const state = states.get(sessionID)
    if (!state || state.status !== GOAL_STATUS.ACTIVE || state.inFlight) return

    if (state.suppressNextIdle) {
      state.suppressNextIdle = false
      touch(state)
      return
    }

    state.inFlight = true
    touch(state)

    try {
      const messages = await getSessionMessages(sessionID)
      const latestID = latestMessageID(messages)
      if (latestID && latestID === state.lastProcessedMessageID) return
      state.lastProcessedMessageID = latestID

      const initialBlockReason = budgetBlockReason(state)
      if (initialBlockReason) {
        await blockGoal(state, initialBlockReason)
        return
      }

      const evaluation = await evaluateGoal(state, messages)
      if (state.status !== GOAL_STATUS.ACTIVE) return
      if ((await applyEvaluation(state, evaluation)) === "stop") return

      const repeatedBlockReason = budgetBlockReason(state)
      if (repeatedBlockReason) {
        await blockGoal(state, repeatedBlockReason, evaluation.evidence, evaluation.next_action)
        return
      }

      await continueGoal(sessionID, state)
    } catch (error) {
      await blockGoal(state, `Goal evaluation failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      state.inFlight = false
      touch(state)
    }
  }

  const pauseForUserMessage = async (state) => {
    state.status = GOAL_STATUS.BLOCKED
    state.inFlight = false
    state.suppressNextIdle = true
    state.latestReason = `Paused because the user sent a new message while /${commandName} was active.`
    state.latestEvidence = []
    state.latestNextAction = `Run /${commandName} resume to continue the goal, or /${commandName} clear to discard it.`
    touch(state)
    await showToast("Goal paused for user input", "info")
  }

  const writeCommandResponse = (output, text) => {
    replaceParts(output, [textPart(commandResponsePrompt(text))])
  }

  const handleGoalCommand = async (input, output) => {
    if (input.command !== commandName) return

    const sessionID = input.sessionID
    if (!sessionID) {
      replaceParts(output, [textPart("No session ID was available for this goal command.")])
      return
    }

    const rawInput = (input.arguments || "").trim()
    const command = rawInput.toLowerCase()
    const existing = states.get(sessionID)

    if (!rawInput || STATUS_COMMANDS.has(command)) {
      suppressCommandSideEffects(existing)
      writeCommandResponse(output, formatState(existing))
      return
    }

    if (RESUME_COMMANDS.has(command)) {
      if (!existing || existing.status !== GOAL_STATUS.BLOCKED) {
        suppressCommandSideEffects(existing)
        writeCommandResponse(output, "No blocked goal to resume.")
        return
      }

      existing.status = GOAL_STATUS.ACTIVE
      existing.latestReason = "Resumed by user."
      existing.latestNextAction = existing.condition
      existing.suppressNextIdle = false
      existing.ignoreNextUserMessage = true
      touch(existing)
      await showToast("Goal resumed", "info")
      replaceParts(output, [textPart(startGoalPrompt(existing))])
      return
    }

    if (CLEAR_COMMANDS.has(command)) {
      if (!existing || ![GOAL_STATUS.ACTIVE, GOAL_STATUS.BLOCKED].includes(existing.status)) {
        suppressCommandSideEffects(existing)
        writeCommandResponse(output, "No active goal to clear.")
        return
      }

      existing.status = GOAL_STATUS.CLEARED
      existing.inFlight = false
      existing.suppressNextIdle = true
      existing.ignoreNextUserMessage = true
      existing.latestReason = "Cleared by user."
      touch(existing)
      await showToast("Goal cleared", "info")
      writeCommandResponse(output, formatState(existing))
      return
    }

    const state = createGoalState(rawInput)
    state.ignoreNextUserMessage = true
    states.set(sessionID, state)
    await showToast("Goal active", "info")
    replaceParts(output, [textPart(startGoalPrompt(state))])
  }

  return {
    config: (cfg) => {
      evaluatorModel = evaluatorModel || modelFromString(cfg.small_model)
    },

    "command.execute.before": handleGoalCommand,

    "chat.message": async (input) => {
      const state = states.get(input.sessionID)
      if (!state || state.status !== GOAL_STATUS.ACTIVE) return

      if (state.ignoreNextUserMessage) {
        state.ignoreNextUserMessage = false
        return
      }

      await pauseForUserMessage(state)
    },

    event: async (input) => {
      const event = input?.event || input
      if (!isIdleEvent(event)) return

      const sessionID = sessionIDFromEvent(input)
      if (!sessionID) return

      await handleIdle(sessionID)
    },
  }
}

export default {
  id: "goal-plugin",
  server: GoalPlugin,
}
