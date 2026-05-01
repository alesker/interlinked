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
2. Domain skill routing: identify the primary language, framework, runtime, or domain affected by the implementation.
3. Domain skill loading: before editing, load every relevant domain code skill that exists.
   Examples: load `go-code` for Go files and Go packages; load `shell-code` for shell scripts.
4. Implementation guidance: use this skill for the general implementation workflow, and use loaded domain skills upfront to shape domain-specific design choices.
5. Local fit: prefer clear existing patterns; use loaded domain skills to avoid weak new structure or behavior.
6. Scope control: keep changes small and cohesive. Do not add abstractions, dependencies, or compatibility layers unless required.

Domain skills are additive to `technical-implementation`; they do not replace this implementation workflow. If multiple domains are materially touched, load each relevant domain skill.

# Final inspection

Before finalizing non-trivial implementation work, use `change-inspection` as the lightweight inspection pass.

If the change introduced domain-specific structure or behavior, keep every relevant domain code skill loaded and apply it as a focused final checklist.
Examples: `go-code` for Go changes, `shell-code` for shell changes.

Do not turn finalization into formal PR review; leave PR-level merge judgment to the Review agent.

# Output

When reporting implementation work, summarize:
- what new structure or behavior was introduced
- which domain skill guided the implementation, if any
- what verification or inspection was run
- what remains unverified or uncertain
