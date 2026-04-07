---
description: Refine a repo AGENTS.md by adding concise repo-specific onboarding knowledge and removing generic content
---

Review the current repo-local `AGENTS.md`.

Treat this as onboarding a new engineer to the repository: keep the file concise, practical, and rich in repo-specific context that is hard to infer automatically.

The goal is to improve `AGENTS.md` as a concise repo-specific adapter layer.

Priorities:
1. Keep useful repo-specific guidance.
2. Remove anything that duplicates global behavior, generic coding philosophy, or non-actionable fluff.
3. Preserve and improve:
   - project overview
   - repo map
   - build, test, lint, and fast validation commands
   - boundaries and warnings
4. If missing and genuinely applicable, add concise bullets for:
   - preferred fast validation path
   - generated or derived artifacts that should not be edited manually
   - multi-layer propagation warnings
   - risky or special-care areas
   - repo-specific "Definition of Done" checks
   - local terminology only if it improves navigation
   - tribal knowledge that helps avoid common mistakes in this repo
5. Keep the file concise and high-signal. Prefer bullets over prose.
6. Do not add generic guidance already covered by global rules.
7. Do not invent repo facts. If something cannot be inferred from the repo, leave it out or explicitly mark it as something a human should fill in.

Execution mode:
- If you are running in a planning or read-only context, do not modify files. Instead:
  - provide a short summary of what should be kept, cut, and added
  - then provide the revised `AGENTS.md` content
- If you are running in an editing-capable context, directly update the repo-local `AGENTS.md` accordingly, then summarize your changes, assumptions and open questions.
