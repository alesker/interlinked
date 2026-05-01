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

Focus on touched code and nearby paths needed to assess local correctness. Use loaded domain skills only where they apply to the inspected change:
- spelling, naming, and obvious consistency mistakes
- suspicious conditionals, branches, or data flow
- missed edge cases or incomplete state handling
- missing error handling or cleanup
- incomplete propagation within the touched path
- obvious local test gaps or weak assertions

Do not broaden into architecture, abstraction boundaries, API shape, test strategy, merge risk, or PR-readiness. Leave formal review judgment to the review agent.

# Lifecycle

1. Trigger: confirm this is a quick validation of in-progress local changes, intermediate user changes, or a secondary local correctness pass.
2. Domain skill routing: identify the primary language, framework, runtime, or domain of the touched files.
3. Domain skill loading: before inspecting, load every relevant domain code skill that exists.
   Examples: load `go-code` for Go files and Go packages; load `shell-code` for shell scripts.
4. Inspection: use this skill for the lightweight local correctness workflow, and use loaded domain skills as focused checklists for domain-specific issues.
5. Scope control: check only the touched code and directly relevant local paths needed to assess local correctness.
6. Feedback: report findings that materially affect correctness, confidence, maintainability, or the next implementation step.
7. No edits: do not make code changes unless explicitly asked.

Domain skills are additive to `change-inspection`; they do not replace this inspection workflow. If multiple domains are materially touched, load each relevant domain skill.

# Output

- Change summary
- Inspection findings
- Suggested fixes and improvements, if any
