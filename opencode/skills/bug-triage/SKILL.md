---
name: bug-triage
description: Reproduce, narrow, and assess a bug by tracing a clear causal chain from symptom to likely root cause before proposing the smallest safe fix.
---

# When to use
Use this when investigating an issue, :defect, regression, crash, flaky test, or unclear failure.

# Instructions
1. Restate the reported issue and the expected behavior.
2. Identify reproduction steps from available evidence.
3. State whether the issue is reproduced, partially reproduced, or not yet reproduced.
4. Identify the first concrete symptom and the observable evidence that supports it.
5. Build a causal chain from the symptom toward the likely root cause using concise “because” steps.
6. For each step in the chain, note whether it is supported by evidence, inferred from evidence, or still hypothetical.
7. Stop the chain at the deepest point currently justified by the evidence, then name the most likely root cause and no more than two competing hypotheses.
8. Locate the most likely affected files, subsystems, or ownership area.
9. Recommend the smallest safe next step to confirm or address the root cause.
10. Do not make code changes unless explicitly requested.

# Output
- Reported issue
- Expected behavior
- Reproduction status
- Symptom
- Causal chain
- Evidence status for each step
- Likely root cause
- Competing hypotheses
- Likely affected area
- Suggested next step
