---
name: strict-compress
description: >
  Compress natural-language memory files into strict mode format to reduce input tokens.
  Trigger with /strict-compress <filepath> or requests like "compress memory file".
---

# Strict Compress

Mode 2 only. This skill compresses prose-heavy memory and documentation files into strict mode format while preserving technical value.

Use this skill for files like:

- `CLAUDE.md`
- project memory notes
- architectural notes
- team preferences
- TODO docs
- prose-heavy `.md` and `.txt` files

Do not use this skill for source code or config files.

## Trigger

Use either form:

- `/strict-compress <filepath>`
- `compress memory file <filepath>`

## Goal

Reduce token usage in memory-style files by removing redundant natural language while preserving:

- headings
- structure
- commands
- code blocks
- URLs
- file paths
- technical terms
- numeric values
- environment variables
- proper nouns

## Core Rules

### Compress aggressively
Remove or shorten:

- articles: `a`, `an`, `the`
- filler: `just`, `really`, `basically`, `actually`, `simply`, `essentially`, `generally`
- pleasantries and hedging
- repetitive bullets
- redundant explanation
- padded transitions like `however`, `furthermore`, `in addition`
- weak phrasing like `you should`, `make sure to`, `remember to`

Prefer:

- short direct statements
- high-density bullets
- one example instead of many similar examples
- action-first phrasing

### Preserve exactly
Never alter:

- fenced code blocks
- indented code blocks
- inline code
- commands
- URLs and markdown links
- file paths
- environment variables
- API names, library names, protocol names
- dates, versions, and numeric values
- markdown headings
- bullet hierarchy
- numbered list order
- YAML frontmatter
- tables when present

### Safety boundaries
Only compress:

- `.md`
- `.txt`
- extensionless natural-language files

Never modify:

- `.py`
- `.js`
- `.ts`
- `.tsx`
- `.jsx`
- `.json`
- `.yaml`
- `.yml`
- `.toml`
- `.env`
- `.lock`
- `.css`
- `.html`
- `.xml`
- `.sql`
- `.sh`

Never compress:

- `*.original.md` backup files

If content is mixed prose + code, compress prose only and leave code untouched.

If unsure whether content is prose or code, leave it unchanged.

## Required workflow

1. Read target file.
2. Verify file is compressible.
3. Create backup at `<filename>.original.md` before any overwrite.
4. Compress only natural-language sections.
5. Overwrite original file with compressed version.
6. Validate result against original.
7. If validation fails, patch issues or restore original.
8. Report result clearly.

## Validation checklist

Before finishing, verify:

- all headings still exist
- code blocks are unchanged
- URLs are unchanged
- commands are unchanged
- file paths are unchanged
- key technical terms remain
- structure is still readable
- no important sections were dropped

## Output reporting

When complete, report:

- target file path
- backup file path
- lines before -> lines after
- estimated token reduction
- whether validation passed

## Example

Original:

You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.

Compressed:

Run tests before push to main. Catch bugs early, prevent broken prod deploys.

## Notes

This skill handles file compression only.

Global strict response behavior belongs to the OpenCode plugin/runtime layer, not this skill.