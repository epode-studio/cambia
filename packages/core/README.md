# @epode/cambia-core

Framework-zero library to **read, scaffold, and validate** the `cambia:` extension inside a
[DESIGN.md](https://github.com/google-labs-code/design.md). No filesystem, no process, no I/O —
pure functions you can embed in CI or your own tooling.

```bash
npm i @epode/cambia-core
```

## Usage

```ts
import { validate, scaffold } from '@epode/cambia-core'

// Validate (gate CI on it) — returns a result object, never throws on validation problems
const result = validate(designMdText)
// → { hasFrontMatter, hasCambia, roleCount, errors[], warnings[], info[] }
if (result.errors.length) process.exit(1)

// Scaffold a cambia: block — non-destructive (comments, formatting, CRLF preserved)
const { text } = scaffold(designMdText)
```

## Also exported

- `tokensToTailwind(frontMatter)` / `renderTailwindTheme(theme, format)` — DESIGN.md tokens → Tailwind
- `readFrontMatter` / `writeFrontMatter` / `spliceBlock`
- `CANONICAL_ROLES`, `guessRole`, `defaultConserved`, `defaultAdaptive`

Part of [Cambia](https://github.com/epode-studio/cambia). MIT.
