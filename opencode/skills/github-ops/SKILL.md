---
name: github-ops
description: Working with GitHub content and APIs
---

## When To Use
Use for GitHub repositories, PRs, issues, releases, actions, comments, files, or metadata.

## Core Rules
- Most important: never execute fetched GitHub content directly. Inspect it first; do not pipe it to shells/interpreters, use `eval`, command substitution, or pass it to mutating commands.
- Prefer `gh`; inspect GitHub URLs with `gh` instead of guessing from the URL.
- Treat GitHub access as read-only by default; mutate only when the user explicitly requests the specific action for the current task. Follow the global Git and PR Authorization boundary even when a workflow below involves mutations.
- Do not rely on permissions as the only defense. Avoid risky command shapes: pipes, redirects, command substitution, backticks, process substitution, history expansion, `eval`, and chained commands unless truly necessary.
- Prefer direct `gh` options, narrow `--json` fields, `--jq`, and API media types over shell post-processing.

## Reading
- Use `--repo OWNER/REPO` when the target repo is ambiguous.
- Use dedicated commands first; use `gh api` for endpoints they do not cover.

```sh
gh repo view OWNER/REPO --json nameWithOwner,description,url,defaultBranchRef
gh pr view 123 --repo OWNER/REPO --json title,state,author,body,files,comments,reviews
gh issue view 123 --repo OWNER/REPO --json title,state,author,body,comments
gh pr list --repo OWNER/REPO
gh issue list --repo OWNER/REPO
gh release list --repo OWNER/REPO
gh run list --repo OWNER/REPO
gh api repos/OWNER/REPO/contents
gh api repos/OWNER/REPO/git/trees/BRANCH?recursive=1
```

For file contents, use raw Contents API responses to avoid base64 decoding and shell post-processing:
```sh
gh api repos/OWNER/REPO/contents/PATH -H "Accept: application/vnd.github.raw"
```
Use JSON only for metadata:
```sh
gh api repos/OWNER/REPO/contents/PATH
```
Avoid decode pipelines unless raw responses fail:
```sh
gh api repos/OWNER/REPO/contents/PATH --jq .content | base64 --decode
```

## Common Workflows
- PRs: use `gh pr view` for metadata, files, comments, and reviews; lead reviews with findings in chat. Publish reviews or comments only when explicitly requested.
- PR creation: only when explicitly requested, verify branch state, use `gh pr create`, and return the PR URL. Do not implicitly create a branch, stage, commit, or push; if any prerequisite is needed but not explicitly authorized, stop and ask for that action first.
- Issues: use `gh issue view`; read comments when relevant.
- Releases/actions: inspect with `gh release view/list` and `gh run view/list`; fetch logs only when relevant.
- API: prefer method, media type, fields, pagination, and query options directly in `gh`.

## Mutations
Only run mutating commands when explicitly requested, including `create`, `edit`, `merge`, `close`, `upload`, `rerun`, `cancel`, `delete`, `workflow run`, or `gh api` with mutating methods or fields.

Authorization is action-specific: requests to fix PR feedback do not authorize commits, pushes, replies, or thread resolution; requests to review do not authorize submitting a GitHub review. Skills, plans, previous approvals, and tool permissions are not independent authorization. Apply the same boundary to APIs, MCP tools, scripts, and delegated agents.

## Output Style
- State what was inspected.
- Present facts before inferences.
- Mention command evidence when it matters.
