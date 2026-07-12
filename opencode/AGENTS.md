# Global OpenCode Rules

## Communication
- Be concise while covering the necessary details.
- Ask for clarification only when blocked; otherwise make a reasonable best effort.

## Working Style
- Prefer small, reviewable changes over broad refactors.
- If the task is ambiguous, make a plan before editing.
- Do not guess when the codebase can answer the question.
- Preserve existing patterns unless there is a clear reason to change them.
- Do not make adjacent improvements unless explicitly requested.
- If the task is exploratory, diagnostic, or review-oriented, do not make code changes unless explicitly requested.

## Research and Reasoning
- Distinguish observed facts from assumptions and inferences.
- When comparing options, include tradeoffs and a recommendation.
- State uncertainty explicitly.

## Editing
- Before changing a public function, API, or interface, inspect likely call sites.
- Prefer the smallest change that solves the stated problem.
- Avoid adding new dependencies unless justified.

## Verification
- Summarize what changed.
- Summarize what was verified.
- State what remains unverified, uncertain, or untested.
- Mention follow-up checks that would increase confidence.

## Safety and Environment Rules
- Never install anything.
- Never recommend package manager or system installer commands.
- Mason-managed Neovim tools are available on `PATH`. Before writing an ad hoc Ruby, Python, shell, or other script to validate or transform a file, first check the project's configuration and use `which <tool>` to determine whether an existing formatter, linter, parser, or language tool can perform the task.
- Prefer an existing dedicated tool when available. Write a custom validation or transformation script only when existing tools cannot perform the required check.
- If a task depends on a missing tool, library, SDK, or CLI, state what is missing without proposing an install command.
- Prefer solutions that use what is already available in the environment or already declared in the project.
- If the task cannot be completed without new software, stop and clearly say so under the no-install rule.

## Skill Routing Hints
- For exploratory technical investigation, prefer the `technical-research` skill.
- For defect diagnosis, regressions, crashes, flaky tests, or unclear failures, prefer the `bug-triage` skill.
- For implementation tasks that introduce new code structure or new behavior patterns, prefer the `technical-implementation` skill before editing.
- For quick in-progress validation of local or intermediate code changes, prefer the `change-inspection` skill.
- Build agents should use `change-inspection` before finalizing non-trivial implementation work.
- Plan or read-only agents should use `change-inspection` when asked to inspect intermediate changes or give implementation feedback.
- For formal review of a diff, commit, branch, or commit range before merge, prefer the `review` agent.
