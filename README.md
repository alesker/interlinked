# Interlinked

![](https://static.wikia.nocookie.net/bladerunner/images/2/24/BR2049_baseline_test.jpg)

## Within cells interlinked

This setup targets [OpenCode](https://github.com/anomalyco/opencode) and is managed with [GNU Stow](https://www.gnu.org/software/stow/).

```
stow .
```


## Within cells interlinked

### Agents

#### Primary agents
- Rubber-Duck :duck:
- Plan <sup>[Built-in]</sup>
- Build <sup>[Built-in]</sup>
- Review 
- Vibe-Coder :shit: 
- `Pair-Programmer` :ghost:

#### Sub-agents
- general <sup>[Built-in]</sup>
- explore <sup>[Built-in]</sup>
- prompt-editor
- tech-skill-smith

## Within cells interlinked

### Skills

- technical-research
- bug-triage
- technical-implementation
- change-inspection
- github-ops
- `go-code`
- `shell-code`

## Within cells interlinked

### Commands

- goal
- onboard-agents

## Within cells interlinked

### MCP Tools

- linear

## Within cells interlinked

### Plugins

- shell-env <sup>[Local]</sup>
- goal <sup>[Local]</sup>
- mohak34/opencode-notifier

## Within cells interlinked

### Claude Code

OpenCode is the source of truth, but it's possible to derive a user-level [Claude Code](https://code.claude.com/docs/en/overview) setup from it.

```sh
./interlink-claude
```

This command
- generates Claude-native agents under `~/.claude/agents`
- links the canonical skills into `~/.claude/skills`
- adds a managed import block to `~/.claude/CLAUDE.md`

It owns only files recorded in `~/.claude/.interlink-claude-manifest` (existing Claude configuration is preserved, and name collisions fail without overwriting anything).
A symlinked `CLAUDE.md` is also left untouched and reported as a conflict.

Skill edits are reflected immediately through symlinks.
Run the command again after changing agents or moving the checkout.
Use `./interlink-claude --check` to report drift and conflicts without changing files.

Agent translation accepts single-line, unquoted descriptions and scalar `allow`, `ask`, or `deny` values for `edit`, `bash`, and `webfetch`.
It fails explicitly on more complex forms rather than silently generating different Claude behavior.


## Within cells interlinked

> *What a day, hmmm?*

![](https://static.wikia.nocookie.net/bladerunner/images/7/7d/Joi_and_K.jpg)
