---
name: technical-implementation
description: Guide non-trivial implementation work that introduces new code structure or behavior patterns.
---

# When to use

Use `technical-implementation` before editing when implementation introduces new code structure or new behavior patterns.

Typical triggers: new packages, exported types/classes, scripts, commands, feature flows, public APIs, config surfaces, reusable abstractions, concurrency, persistence, or automation entrypoints.

Do not use this for narrow edits inside established code unless the change is complex, risky, or crosses a domain boundary. Infer local style instead.

# Lifecycle

1. Trigger: confirm the task adds new structure or behavior, or is otherwise complex, risky, or cross-domain.
2. Domain skill selection: identify the primary language, framework, runtime, or domain. Before editing, load the relevant code skill when one exists, such as `go-code` or `shell-code`.
3. Implementation guidance: use the domain skill upfront to shape the work, not only as a final checklist.
4. Local fit: prefer clear existing patterns; use the domain skill to avoid weak new ones.
5. Scope control: keep changes small and cohesive. Do not add abstractions, dependencies, or compatibility layers unless required.

# Final inspection

Before finalizing non-trivial implementation work, use `change-inspection` as the lightweight inspection pass.

If the change introduced domain-specific structure or behavior, also apply the relevant domain code skill as a focused final checklist and address concrete findings.

Do not turn finalization into formal PR review; leave PR-level merge judgment to the Review agent.

# Output

When reporting implementation work, summarize:
- what new structure or behavior was introduced
- which domain skill guided the implementation, if any
- what verification or inspection was run
- what remains unverified or uncertain
