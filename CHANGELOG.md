# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-01

### Added
- Initial public release of `opencode-strict-mode`
- OpenCode plugin package scaffold with TypeScript build output
- Global strict-mode instruction injection through OpenCode chat runtime
- Shared strict-mode rule source for consistent prompt behavior
- Public README with GitHub and npm install instructions
- MIT license
- Git ignore rules for local development artifacts
- Legacy `strict-compress` helper scripts retained for optional Mode 2 workflows
- `SKILL.md` narrowed to Mode 2 file-compression documentation

### Behavior
- Strict mode is enabled globally by default after plugin install
- Responses are shorter, more direct, and technically exact
- Code blocks, commands, logs, stack traces, file paths, and exact error text are preserved

### Build and publish
- TypeScript build configured to emit distributable files into `dist/`
- GitHub install flow documented, including requirement to commit built `dist/` output
- Package metadata prepared for public GitHub distribution

### Toggle support
- Added session-level strict mode toggles derived from chat history
- Supports `/strict on`, `/strict off`, `strict mode`, `be strict`, `normal mode`, and `stop strict`
- Removes injected strict-mode rule from runtime when strict mode is turned off for the session
- Re-injects the strict-mode rule when users turn strict mode back on

### Notes
- Mode 2 file compression remains optional and separate from the global plugin behavior