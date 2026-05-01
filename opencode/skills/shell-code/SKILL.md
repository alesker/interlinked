---
name: shell-code
description: Guide and review shell code correctness, safety, and quality
---

# Skill: Shell Code

## When to use

Use this skill before implementing or when reviewing repository shell changes that need shell-specific judgment. Default target: Bash-oriented code that stays zsh-compatible, plus POSIX `sh`, standalone scripts, and snippets embedded in CI, Makefiles, Dockerfiles, or package scripts.

For implementation, use this when introducing new shell structure or behavior patterns, such as standalone scripts, automation entrypoints, CI snippets, package scripts, destructive filesystem operations, environment setup, shell functions, or cross-shell behavior.

This skill complements `technical-implementation`, `change-inspection`, and "Review" agents. Do not repeat generic implementation or review advice unless the issue depends on shell behavior or idiom.

## Stance

Work like a pragmatic senior shell engineer. Prefer simple, readable, cohesive scripts over clever expansion, dense one-liners, or abstraction for its own sake.
During review, flag only issues affecting correctness, lifecycle safety, coupling, testability, cohesion, clarity, portability, or future changeability. Prefer fewer high-signal findings and the smallest idiomatic fix.

Prefer readable shell for realistic repository inputs over complex handling of every theoretical edge case. Avoid broad rewrites unless a shell-specific design problem cannot be fixed locally.

## Implementation guidance

Before introducing new shell structure or behavior, use the shell-specific review checklist proactively as design guidance. Decide target shell, portability expectations, argument handling, environment scope, cwd assumptions, cleanup, failure behavior, and filesystem safety before writing commands.

## Shell-specific review checklist

Use only checks relevant to the diff or implementation output.

### Shell dialect and portability

- Prefer shell features beyond POSIX `sh` when they improve readability, but stay within the Bash/zsh common subset by default.
- Treat `[[ ]]`, process substitution, arrays, `source`, and similar non-POSIX conveniences as acceptable when they work in both Bash and zsh.
- Flag Bash-only behavior that breaks zsh compatibility, especially array indexing, array expansion/splitting, `declare`/`local` options, `mapfile`/`readarray`, and Bash-specific parameter expansion.
- Allow Bash-only constructs only when the file clearly opts out of zsh compatibility with shebang, comments, or surrounding context.
- Treat `#!/bin/bash`, `#!/usr/bin/env bash`, and other explicit Bash shebangs as valid Bash targets, but do not assume they opt out of zsh compatibility unless the code or context says so.
- Flag Bash syntax only when the script declares POSIX `sh`, uses a misleading shebang, or must run in a non-Bash shell.
- Check target command/flag availability, especially GNU/BSD differences (`sed -i`, `readlink -f`, `xargs -r`, `date`, `mktemp`, `stat`, `find`).
- Do not assume interactive state, aliases, functions, shell options, or cwd unless established.

### Quoting, expansion, and globbing

- Flag unquoted expansions when splitting, globbing, empty values, or whitespace can change behavior.
- Preserve Bash array elements with `"${array[@]}"`; use joins/splitting only intentionally.
- Check command substitutions for trailing newline and multi-line handling; avoid parsing human-oriented output when safer interfaces exist.
- Check globs for empty, hidden, or unintended matches; use `find`, `nullglob`, or existence checks when needed.
- Use `IFS=` and `read -r` when input preservation matters.

### Exit status, errors, and pipelines

- Check failures that matter, including directory changes, filesystem commands, search commands, setup, and cleanup.
- Treat `set -e` as limited: failures can be masked by conditionals, command substitutions, subshells, negation, pipelines, and `&&`/`||` chains.
- For pipelines where any stage may fail, use Bash `pipefail` or explicit checks; in POSIX `sh`, check status deliberately.
- Avoid broad suppression (`cmd || true`) unless the ignored failure is intentional and narrow; distinguish expected false/not-found statuses from real errors.

### Variables, environment, and arguments

- Validate required arguments and environment before use; use clear defaults or required checks where appropriate.
- Avoid accidental environment leakage: prefer Bash `local` and narrow `VAR=value command`; restore global changes to `PATH`, `IFS`, `HOME`, `TMPDIR`, `CDPATH`, and shell options unless intentionally owning the process.
- Use `--` before path or user-provided operands for commands that accept options.
- Avoid `eval`; require a strong reason and careful quoting across generated code/data boundaries.

### Paths, filesystem safety, and cleanup

- Quote path operands; handle spaces, newlines, leading dashes, symlinks, and missing dirs when realistic.
- Avoid destructive recursive/wildcard operations (`rm -rf`, `chmod -R`, `chown -R`) unless targets are validated, scoped, and non-empty when required.
- Use `mktemp` and traps for temps; avoid predictable paths and preserve or intentionally replace the original exit status.
- With `cd`, check success and localize via subshells or restore the prior directory when needed.

### Functions, subshells, and control flow

- Check whether variables assigned in pipelines/subshells are expected to persist; behavior differs across shells.
- Prefer functions for repeated logic, but do not hide process-wide side effects (`cd`, option changes, exports).
- Ensure traps, signals, and background jobs do not leak children or leave partial state.
- Avoid fragile `for x in $(...)` parsing; prefer `while IFS= read -r`, Bash arrays, or null-delimited data for filenames.

### Tooling and maintainability

- Treat ShellCheck-style diagnostics as strong signals, but flag only target-shell-relevant concrete risks.
- Prefer shell for orchestration; for complex data structures, parsing, or cross-platform logic, consider a repository-supported language.
- Keep CI/package snippets debuggable; dense quoting layers are risks when they change shell evaluation.
- Prefer direct command calls over defensive `command foo` unless aliases/functions or lookup behavior are a real concern.

## Do not flag by default

Do not flag these unless they cause a concrete shell-specific problem:

- Bash syntax in a script that clearly targets Bash.
- POSIX style in Bash when clear and correct.
- `#!/bin/bash` or `#!/usr/bin/env bash` shebangs for repository scripts that intentionally use Bash.
- Bash-only constructs when the file clearly opts out of zsh compatibility.
- `set -e`, `set -u`, or `pipefail` being present or absent by itself; review the actual error handling semantics.
- Intentional word splitting, globbing, or pattern matching when documented or clear from structure.
- Small local scripts assuming repository-controlled filenames or known CI/runtime tools.
- Short, readable one-off snippets in build or CI files.
- `echo` instead of `printf` for simple, controlled output where portability, escape handling, or exact formatting are not material.
- Direct command calls instead of `command`-prefixed calls when command shadowing is not a concrete risk.
- Simple readable handling that skips edge cases when inputs are repository-controlled or failure is low-risk.

## Severity

- High: likely data deletion/corruption, unintended code execution, secret mishandling, ignored critical failure, broken cleanup, wrong filesystem target, or failure on the declared runtime shell.
- Medium: portability mismatch, fragile parsing, masked pipeline failure, unsafe temp handling, environment leakage, non-obvious subshell behavior, or path/argument handling likely to break realistic repository usage.
- Low: smaller shell idiom, quoting clarity, or ShellCheck-style issue that may accumulate but is not materially risky yet.

## Output

Integrate shell-specific findings into the host implementation, inspection, or review format. Put findings first when reviewing, ordered by severity. Include severity, location, shell-specific impact, and the smallest practical fix when possible.

If there are no shell-specific findings, say: `No shell-specific findings.` Include only shell-specific open questions, assumptions, or residual risks that affect the implementation, inspection, or review judgment.
