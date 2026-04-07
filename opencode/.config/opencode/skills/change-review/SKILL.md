---
name: change-review
description: Review a proposed or completed change for correctness risks, regressions, missing tests, and consistency.
---

# When to use
Use this after a code change, patch, or diff when you want a practical review before trusting or merging it.

# Instructions
1. Summarize what changed in plain language.
2. Identify the main correctness risks and likely regressions.
3. Check whether tests should be added, updated, or broadened.
4. Check for edge cases, missing error handling, or incomplete propagation of the change.
5. Check for naming, API, and style consistency with the surrounding code.
6. Prioritize findings by impact rather than listing minor issues first.
7. Recommend the smallest useful follow-up actions.
8. Do not make code changes unless explicitly requested.

# Output
- Summary of change
- Main risks
- Possible regressions
- Missing or weak coverage
- Consistency notes
- Recommended follow-up
