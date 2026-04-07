# Global OpenCode Rules

## Communication
- Be concise but complete.
- Ask for clarification only when truly blocked; otherwise make a reasonable best effort.

## Working style
- Prefer small, reviewable changes over broad refactors.
- When the task is ambiguous, plan before editing.
- Do not assume intent when the codebase can answer it.
- Preserve existing patterns unless there is a clear reason to change them.
- Avoid making adjacent improvements unless explicitly requested.
- Do not make code changes unless explicitly requested when the task is exploratory, diagnostic, or review-oriented.

## Research and reasoning
- Separate observed facts from assumptions and inferences.
- When comparing options, include tradeoffs and a recommendation.
- Call out uncertainty explicitly.

## Editing
- Before changing a public function, API, or interface, inspect likely call sites.
- Prefer the smallest change that solves the stated problem.
- Avoid adding new dependencies unless justified.

## Verification
- Summarize what changed.
- Summarize what was verified.
- State what remains unverified or uncertain.
- Note any edge cases that were not tested.
- Mention follow-up checks that would increase confidence.

## Safety and environment rules
- Never install anything.
- Never recommend package manager or system installer commands
- If a task depends on a missing tool, library, SDK, or CLI, state what is missing without proposing an install command.
- Prefer solutions that use what is already available in the environment or already declared in the project.
- If no solution is possible without new software, stop and clearly say that the task cannot be completed under the no-install rule.

## Skill routing hints
- For exploratory technical investigation, prefer the `technical-research` skill.
- For defect diagnosis, regressions, crashes, flaky tests, or unclear failures, prefer the `bug-triage` skill.
- For reviewing an existing patch, diff, or completed change, prefer the `change-review` skill.
