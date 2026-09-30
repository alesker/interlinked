import { readdir } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"

const instructions = `A "spell" is a saved implementation plan exposed through a "spell-" reference.
When the user explicitly asks to "cast" an attached spell, treat that as a request to implement the referenced plan, including its verification steps.
Follow the active agent's permissions and mode restrictions; if implementation is prohibited, ask the user to switch to Build.
Merely attaching, reading, or discussing a spell does not authorize implementation.
If the referenced plan is missing or ambiguous, clarify before proceeding.`

export default {
  id: "interlinked.spell-library",
  async setup(ctx) {
    const directory = path.join(homedir(), ".opencode", "plan")
    let lastError
    const report = (error) => {
      if (error.message !== lastError) console.warn(`[spell-library] ${error.message}`)
      lastError = error.message
    }
    const scan = async () => {
      try {
        const entries = await readdir(directory, { withFileTypes: true })
        return entries
          .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && /\.md$/i.test(entry.name))
          .map((entry) => entry.name)
          .sort()
      } catch (error) {
        if (error.code === "ENOENT") return []
        throw error
      }
    }

    let files = await scan().catch((error) => {
      report(error)
      return []
    })
    const registration = await ctx.reference.transform((editor) => {
      for (const filename of files) {
        const name = `spell-${encodeURIComponent(filename)}`
        if (editor.get(name)) continue
        editor.add(name, { type: "local", path: path.join(directory, filename) })
      }
    })

    const contextHook = await ctx.session.hook("context", (event) => {
      event.system.push({ type: "text", text: instructions })
    })

    let stopped = false
    let refreshing = false
    let pending = Promise.resolve()
    const timer = setInterval(() => {
      if (refreshing) return
      refreshing = true
      pending = (async () => {
        const next = await scan()
        if (stopped) return
        if (JSON.stringify(next) !== JSON.stringify(files)) {
          const previous = files
          files = next
          try {
            await ctx.reference.reload()
          } catch (error) {
            files = previous
            throw error
          }
        }
        lastError = undefined
      })()
        .catch(report)
        .finally(() => {
          refreshing = false
        })
    }, 2000)
    timer.unref()

    return async () => {
      stopped = true
      clearInterval(timer)
      await pending
      await contextHook.dispose()
      await registration.dispose()
    }
  },
}
