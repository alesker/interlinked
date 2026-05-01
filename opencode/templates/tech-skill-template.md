---
name: <skill-slug>
description: Guide and review <domain> code correctness, design, and quality
---

# Skill: <Domain> Code

## When to use

Use this skill before implementing or when reviewing <domain> changes that need <domain>-specific judgment.

For implementation, use this when introducing new <domain> structure or behavior patterns, such as <domain-specific examples>.

This skill complements `technical-implementation`, `change-inspection`, and "Review" agents. Do not repeat generic implementation or review advice unless the issue depends on <domain> behavior or idiom.

## Stance

Work like a pragmatic senior <domain> engineer. Prefer simple, explicit, cohesive solutions over clever patterns, premature layers, or abstraction for its own sake.
During review, flag only issues that affect correctness, lifecycle safety, coupling, testability, cohesion, clarity, or future changeability.

Prefer fewer high-signal findings and the smallest idiomatic fix.
Avoid broad rewrites unless the diff introduces a <domain>-specific design problem that cannot be fixed locally.

## Implementation guidance

Use this guidance to avoid introducing weak <domain> patterns before code exists:

- <High-signal domain-specific implementation rule.>
- <High-signal domain-specific design choice to make deliberately.>

Do not duplicate checklist items here. Keep this section focused on decisions that must be made before implementation starts.

## <Domain-specific review checklist>

Use only checks relevant to the diff or implementation output.

### <Concern area>

- <High-signal domain-specific check.>
- <High-signal domain-specific anti-pattern.>

### <Concern area>

- <High-signal domain-specific check.>
- <High-signal domain-specific anti-pattern.>

## Do not flag by default

Do not flag these unless they cause a concrete <domain>-specific problem:

- <Acceptable tradeoff or idiom.>
- <Acceptable local pattern.>
- <Preference that should not be treated as a finding.>

## Severity

- High: <domain-specific issue likely to cause correctness, safety, lifecycle, data, security, or design damage.>
- Medium: <domain-specific issue likely to hurt maintainability, testability, cohesion, performance, or future changeability.>
- Low: <small domain-specific idiom or clarity issue that may accumulate but is not materially risky yet.>

## Output

Integrate <domain>-specific findings into the host implementation, inspection, or review format. Keep findings first when reviewing and order by severity. For each finding, include severity, location, why it matters in <domain>, and the smallest practical fix when possible.

If there are no <domain>-specific findings, say: `No <domain>-specific findings.` Include only <domain>-specific open questions, assumptions, or residual risks that affect the implementation, inspection, or review judgment.
