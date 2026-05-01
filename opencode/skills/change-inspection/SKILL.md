---
name: change-inspection
description: Inspect in-progress local changes for quick correctness, edge-case, error-handling, and consistency feedback.
---

# When to use

Use this for quick validation while a change is still in progress, or when asked to inspect intermediate local changes.

This is a lightweight local correctness pass, not a formal PR review. It is intended for:
- Build agents validating their own non-trivial work
- Plan/read-only agents inspecting intermediate user changes
- Review agents adding a secondary local correctness pass

# Scope

Focus on touched code and nearby paths needed to assess local correctness:
- spelling, naming, and obvious consistency mistakes
- suspicious conditionals, branches, or data flow
- missed edge cases or incomplete state handling
- missing error handling or cleanup
- incomplete propagation within the touched path
- obvious local test gaps or weak assertions

Do not broaden into architecture, abstraction boundaries, API shape, test strategy, merge risk, or PR-readiness. Leave formal review judgment to the review agent.

# Instructions

1. Summarize the inspected change in plain language.
2. Check only the touched code and directly relevant local paths.
3. Report findings that materially affect correctness, confidence, maintainability, or the next implementation step.
4. Keep feedback concrete, evidence-based, and tied to specific code.
5. Prefer the smallest useful fixes or improvements.
6. When changed code introduces new domain-specific structure or behavior, apply the relevant domain code skill as a focused checklist, but keep this inspection lightweight.
7. Do not make code changes unless explicitly asked.

# Output

- Change summary
- Inspection findings
- Suggested fixes and improvements, if any
