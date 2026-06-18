# Read and validate your adaptive design system config

**`@epode/cambia-core`** is the small, dependency-light library behind
[Cambia](https://github.com/epode-studio/cambia) — the toolkit that lets your app's interface
**adapt to each user**. Use this package to read, add, and validate Cambia's settings inside a
[DESIGN.md](https://github.com/google-labs-code/design.md) file, straight from your own scripts
or CI. It does no file or network I/O — just plain functions in, results out.

```bash
npm i @epode/cambia-core
```

## What you can do

```ts
import { validate, scaffold } from '@epode/cambia-core'

// Check a DESIGN.md is set up correctly (great for a CI step)
const result = validate(designMdText)   // → { errors, warnings, info, ... }
if (result.errors.length) process.exit(1)

// Add the adaptive settings to a DESIGN.md without touching the rest of the file
const { text } = scaffold(designMdText) // returns the updated file content
```

Also included:

- **`tokensToTailwind` / `renderTailwindTheme`** — turn your DESIGN.md design tokens into a
  Tailwind theme, so colors, spacing and type stay in sync.
- **`readFrontMatter` / `writeFrontMatter` / `spliceBlock`** — helpers for working with the file.

Most people use the [command-line tool](https://www.npmjs.com/package/@epode/cambia) or the
[runtime](https://www.npmjs.com/package/@epode/cambia-runtime) instead; reach for this package
when you're building your own tooling or CI checks.

Part of [Cambia](https://github.com/epode-studio/cambia). Free and open source (MIT).
