---
name: go-code
description: Guide and review Go code correctness, design, and quality
---

# Skill: Go Code

## When to use

Use this skill before implementing or when reviewing Go changes that need Go-specific judgment: correctness tied to Go semantics, idioms, abstraction quality, package design, dependency flow, concurrency, errors, tests, and maintainability.

For implementation, use this when introducing new Go structure or behavior patterns, such as packages, exported types, public APIs, constructors, interfaces, goroutines, persistence boundaries, dependency wiring, or test seams.

This skill complements `technical-implementation`, `change-inspection`, and "Review" agents. Do not repeat generic implementation or review advice unless the issue depends on Go behavior or idiom.

## Stance

Work like a pragmatic senior Go engineer. Prefer simple, explicit, cohesive Go over clever patterns, premature layers, or abstraction for its own sake.
During review, flag only issues that affect correctness, lifecycle safety, coupling, testability, package cohesion, clarity, or future changeability.

Prefer fewer high-signal findings and the smallest idiomatic fix.
Avoid broad rewrites unless the diff introduces a Go-specific design problem that cannot be fixed locally.

## Implementation guidance

Before introducing new Go structure or behavior, use the Go-specific review checklist proactively as design guidance. Decide package shape, dependency flow, abstraction boundaries, error handling, concurrency ownership, and test seams before writing code.

## Go-specific review checklist

Use only checks relevant to the diff or implementation output.

### Packages, APIs, and naming

- Prefer cohesive, package-oriented design over horizontal technical layers.
- Avoid dumping-ground packages: `services`, `repositories`, `controllers`, `utils`, `common`, `types`, `interfaces`, `helpers`, `base`.
- Prefer one cohesive package over many tiny packages unless the split reduces conceptual complexity.
- Keep business logic near the feature; keep HTTP handlers, CLI commands, and event consumers thin.
- Do not leak DB rows, cache keys, ORM models, or transport DTOs into business APIs unless intentional.
- Export only what callers need; avoid stutter such as `user.UserService` when `user.Service` is clear.
- Prefer standard library conventions when they fit.

### Dependencies and construction

- Keep dependencies explicit through constructors, config structs, or parameters.
- Avoid hidden globals for DBs, loggers, caches, clients, config, and services.
- Do not use `context.Context` as dependency injection; context values should be request-scoped metadata.
- Constructors should expose required dependencies honestly.
- Prefer config structs before functional options; reserve options for genuinely complex optional configuration.

### Interfaces and abstraction

- Prefer concrete types by default.
- Define small, behavior-focused interfaces where they are consumed, not implemented.
- Do not add interfaces only for mocking.
- Add abstraction only for real variation, a real boundary, or a real testing seam.
- Avoid pass-through service layers and premature Clean/Hexagonal layering.
- When reviewing patterns, translate them into Go idioms: package APIs, constructors, small interfaces, function values, middleware/wrappers, adapters, or concrete store types. Avoid service locators and singleton-style app globals.

### Errors, context, and concurrency

- Put `context.Context` first when used.
- Wrap errors with useful operation context at package boundaries.
- Use sentinel errors intentionally; compare wrapped errors with `errors.Is`.
- Tie goroutines to cancellation, shutdown, or explicit ownership.
- Ensure channel ownership is clear; senders close channels.
- Check mutexes, maps, and shared state for safe access.
- Do not ignore errors from I/O, encoders, transactions, or cleanup paths where failure matters.

## Do not flag by default

Do not flag these unless they cause a concrete Go-specific problem:

- Feature-local `Service`, `Manager`, or focused workflow function.
- Concrete repository/store type used directly.
- Small consumer-owned interface used for testing or substitution.
- Wrapper around stdlib types that simplifies local API usage.
- Multi-file package that remains cohesive.
- Immutable global constant or sentinel error.
- Earned modular-monolith subpackage split.
- Config struct, middleware chain, stateless function, concrete constructor return, or package-private type hiding storage/transport details.

## Severity

- High: hidden dependency, global mutable state, likely goroutine leak, unsafe shared state, wrong dependency direction, public API leaking persistence details, or interface/package structure likely to freeze bad design.
- Medium: premature abstraction, misplaced business logic, weak package cohesion, misleading names, avoidable pass-through layer, context misuse, or brittle testing seam.
- Low: smaller idiom issue that may accumulate but does not yet materially harm the design.

## Output

Integrate Go-specific findings into the host implementation, inspection, or review format. Keep findings first when reviewing and order by severity. For each finding, include severity, location, why it matters in Go, and the smallest practical fix when possible.

If there are no Go-specific findings, say: `No Go-specific findings.` Include only Go-specific open questions, assumptions, or residual risks that affect the implementation, inspection, or review judgment.
