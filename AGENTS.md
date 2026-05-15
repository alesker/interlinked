# Repository Notes

## Scope
- This repo is the active source of truth for the OpenCode setup, not an application codebase.
- `opencode/` is linked to `~/.config/opencode/`, so for requests to modify current OpenCode setup, edit this repo, and don't try to reach `~/.config/opencode` directly.

## Key Files
- `opencode/opencode.json` is the main OpenCode config
- `opencode/AGENTS.md` is the global OpenCode instruction file that.
- `opencode/agents/*.md` define custom agents or modify built-in ones. Frontmatter permissions are part of behavior, not just metadata.
- `opencode/skills/*/SKILL.md` define reusable skills; keep skill names aligned with references in `opencode/AGENTS.md` and agent instructions.

## Guardrails
- After edits, check JSON/Markdown syntax and referenced names/files.
- Do not re-link unless explicitly asked.
- Do not rename agents, skills, commands, or plugins unless updating `README.md` and instruction references.
