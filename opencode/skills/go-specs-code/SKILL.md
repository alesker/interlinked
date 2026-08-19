---
name: go-specs-code
description: Guide and review Go Ginkgo/Gomega test specifications; use when planning, implementing, or assessing Go test files and behavior trees.
---

# Skill: Go Specifications Code

## When to use

Use this skill before implementing or when reviewing Go tests that need Go- and Ginkgo-specific judgment: test-file structure, behavioral coverage, fakes, determinism, Ginkgo/Gomega idioms, or CI portability.

For implementation, use this when adding or changing Go test specifications, especially in projects that already use Ginkgo and Gomega.

This skill complements `technical-implementation`, `change-inspection`, and "Review" agents. Do not repeat generic implementation or review advice unless it depends on Go testing or Ginkgo/Gomega behavior.

## Stance

Work like a pragmatic senior Go test engineer. Test critical observable behaviors and meaningful failure modes, not lines or blanket coverage targets. Prefer deterministic, isolated specifications with the smallest appropriate fake over integration-shaped test machinery.

When the target project already uses Ginkgo and Gomega, use them and follow its established suite conventions. Do not introduce them solely for a new test.

Never implement a test file before the user explicitly approves that file's behavioral tree. Work through one test file at a time; approval covers only the named file and its proposed tree.

During review, flag only issues that weaken behavioral confidence, determinism, isolation, diagnostic value, CI portability, or idiomatic Ginkgo/Gomega usage.

Prefer fewer high-signal specifications and the smallest idiomatic change. Avoid broad production rewrites to make tests easier.

## Implementation guidance

- Before planning, examine the relevant production code and existing tests, including suite setup, helpers, fakes, and assertion conventions. Identify the critical behaviors, boundary conditions, and error paths the test must protect.
- Select one test file. Before editing it, present its proposed tree in annotated `[Describe]`, `[Context]`, `[When]`, and `[It]` format. Include only nodes that add behavioral meaning; concatenate each path's labels so it reads as natural English. Nest `[Context]` and `[When]` in either order when that reads more naturally.
- Await explicit approval of that file's tree. Then implement only that approved file, run its targeted file or package tests, characterize any failure, and propose the next file. Make a production fix only when the user explicitly directs it.

### Required proposal format

```text
File: path/to/example_test.go

[Describe] Widget
  # System or behavior under specification.
  [Context] with a configured dependency
    # Relevant state or fixture.
    [When] processing a valid request
      # Action or event, when it improves the sentence.
      [It] returns the saved widget
        # Observable expected behavior.
```

Do not edit the file, write test code, or expand into another file until the user explicitly approves this structure.

The annotated tree is a presentation format, not a mandatory suite shape. Use the shallowest hierarchy that reads naturally. Omit `[Context]` or `[When]` when redundant, and nest them in either order when clearer.

## Go specification review checklist

Use only checks relevant to the diff or implementation output.

### Behavior and hierarchy

- Test observable contracts, critical branches, domain invariants, error handling, and regressions; do not add cases merely to raise coverage.
- Ensure each `Describe`/`Context`/`When`/`It` path reads naturally when labels are concatenated. Remove rigid or redundant nodes; use the shallowest hierarchy that preserves meaning.
- Keep each `It` focused on one observable behavior; keep inseparable outcomes of that behavior, such as lifecycle cleanup and returned error, in the same example. Prefer separate examples for materially different outcomes rather than condition-heavy assertions.
- Use `BeforeEach`, `JustBeforeEach`, and `AfterEach` according to their Ginkgo lifecycle semantics; use `DeferCleanup` to register cleanup with the setup that acquires a resource. Do not hide the action under test in setup when that obscures the specification.

### Isolation, determinism, and fakes

- Control time, randomness, environment, filesystem paths, network access, goroutines, and external state. When CI portability is requested, avoid platform-specific assumptions, shell behavior, timing thresholds, and local services.
- Use small fakes that model the required collaborator behavior. Do not use mocks that assert implementation call sequences when an observable outcome is sufficient.
- Avoid `time.Sleep` and eventually-style polling for synchronous behavior. Use Gomega asynchronous assertions only for genuinely asynchronous behavior, always with a bounded timeout (and polling interval where relevant); ensure goroutines, servers, and temporary resources are cleaned up.
- Use Gomega matchers that explain the contract and produce useful failures; avoid opaque boolean assertions or assertions that merely mirror implementation details.

### Execution and failures

- After approved implementation, run the narrowest relevant Ginkgo file or Go package test command already used by the project.
- Treat a test failure as evidence to inspect. Report whether it indicates an incorrect expectation, test setup problem, existing product defect, flaky/platform-dependent behavior, or an uncharacterized failure.
- Do not modify production code to satisfy a test unless the user explicitly directs the fix. Otherwise preserve the evidence and ask for direction where needed.

## Do not flag by default

Do not flag these unless they cause a concrete Go test problem:

- Table-driven `DescribeTable` specifications when case labels remain clear and failures identify the input.
- Focused helper functions or local fixture builders that make the behavior under test clearer.
- A `When` nested inside a `Context`, or the reverse, when the resulting sentence is more natural.
- A direct concrete dependency in a test when no collaborator substitution is needed.

## Severity

- High: a test is nondeterministic, leaks shared state/resources, relies on real external systems unintentionally, or masks a critical behavioral regression.
- Medium: a specification tests implementation details instead of the contract, has a misleading behavioral tree, weakly isolates a collaborator, or is likely to fail across CI platforms.
- Low: a Ginkgo/Gomega idiom or hierarchy choice reduces clarity or failure diagnostics without materially weakening confidence.

## Output

For test planning, output only the next test file's annotated behavioral tree and await explicit approval before implementation.

For an approved file, report the implemented file, targeted test command and result, and any characterized failures. Then propose the next file's tree; do not begin it without separate explicit approval.

For inspection or review, integrate Go specification findings into the host format. Keep findings first and order by severity. For each finding, include severity, location, why it matters for Go/Ginkgo tests, and the smallest practical fix. If there are no findings, say: `No Go specification-specific findings.`
