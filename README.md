# OpenCode Strict Mode

Global strict-response plugin for OpenCode.

After install, OpenCode applies strict mode by default in every conversation. Responses become shorter, cleaner, and more direct while preserving technical accuracy.

This repo is designed to be published publicly on GitHub or npm as an installable OpenCode plugin. It also includes the original `strict-compress` helper scripts for optional file compression workflows, but the main purpose of this package is **Mode 1: native global strict mode**.

## What this plugin does

When installed as an OpenCode plugin, it injects a default instruction into chat runtime so the assistant will:

- write concise, direct responses
- remove filler, pleasantries, and hedging
- preserve technical meaning
- keep code, commands, logs, and error text exact
- avoid changing code semantics

## Strict mode behavior

### Response style
- concise
- direct
- technically exact
- short phrasing preferred
- fragments allowed when clear

### Removes
- filler words
- empty politeness
- hedging
- redundant explanation

### Preserves exactly
- code blocks
- commands
- logs
- stack traces
- error messages
- file paths
- environment variables
- API names
- library names
- protocol names
- version numbers

### Does not apply to
- git commit messages
- PR descriptions that need full prose
- exact quoted text
- generated code content

## Install from GitHub

Add this plugin to your OpenCode config:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "strict-mode@git+https://github.com/<your-github-user>/<your-repo>.git"
  ]
}
```

Then restart OpenCode.

Strict mode will now apply globally by default.

### GitHub install requirements

If users install directly from GitHub, the repository must already contain built plugin output in `dist/`.

Recommended release flow:
1. run `npm install`
2. run `npm run build`
3. commit `dist/`
4. push tag or release

Without committed `dist/`, GitHub installs may fail because OpenCode loads the package as published content, not your local dev workspace.

## Install from npm

If you publish this package to npm, users can install it with:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-strict-mode@latest"
  ]
}
```

## Example

Normal:

> I'd be happy to help you with that. The issue is likely caused by creating a new object on every render, which causes React to detect a changed prop reference.

Strict mode:

> New object each render. Prop ref changes. React re-renders.

## Scope

This plugin is for **Mode 1 only**:

- global response compression
- native OpenCode runtime behavior
- auto-applied after install

Optional **Mode 2** file compression remains separate and should be used explicitly.

## Repository layout

- `src/` — plugin source
- `scripts/` — optional helper scripts for strict file compression
- `SKILL.md` — legacy skill docs and compression guidance

## Why plugin instead of skill-only?

A normal skill usually depends on trigger phrases or explicit invocation.

A plugin can apply behavior at runtime for every conversation.

That makes it the right delivery method for:

- public GitHub install
- automatic default behavior
- native OpenCode integration

## Development

Install dependencies:

```bash
npm install
```

Typecheck:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Before publishing a GitHub release, rebuild and commit `dist/`.

## Publish checklist

Before publishing publicly:

- remove any personal config files
- remove API keys
- do not commit local `opencode.jsonc`
- replace placeholder GitHub install URL in this README
- verify package name if publishing to npm
- run `npm run typecheck`
- run `npm run build`
- commit `dist/` for GitHub-based installs
- verify `package-lock.json` is up to date

## Roadmap

- v1: always-on strict mode injection
- v2: optional `/strict on` and `/strict off` session toggles
- v3: split Mode 2 compression into a companion package or clean optional skill

## License

MIT