# Cambia

**A DESIGN.md extension. Adds semantic roles and (optional) per-user adaptation on top of [Google's DESIGN.md](https://github.com/google-labs-code/design.md) — not instead of it.**

[![npm](https://img.shields.io/npm/v/cambia.svg)](https://www.npmjs.com/package/cambia)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

DESIGN.md describes how your design system **looks**. Cambia adds what components **do**
(roles) and what may **personalize per user** (adaptive), living inside the *same file* so
it stays lint-clean under Google's tooling and grows toward a living, per-person interface.

> **Cambia** — plural of *cambium*, the thin living layer of a tree where all new growth
> happens, on top of the existing structure; and "it changes" in Italian/Spanish. A growth
> layer that changes. That's the whole idea: a living layer on top of DESIGN.md.

```
DESIGN.md  →  on-brand           (Google — the visual layer)
+ cambia:  →  role-aware         (Cambia — the right component for the job)
+ runtime  →  living             (@cambia/runtime — personalizes per user, on-device, now)
```

Cambia is **a live engine, not just a linter.** `@cambia/core` + the `cambia` CLI declare
and validate the role layer; **`@cambia/runtime`** then makes the declared *adaptive* traits
actually adapt at runtime — each user starts on a born-adapted default and the interface
quietly personalizes to them on-device, while **conserved traits never move.**

---

## Quickstart

You already have (or will write) a `DESIGN.md`. Then:

```bash
npx @google/design.md lint DESIGN.md   # validate the visual layer (Google)
npx cambia init                        # add roles + adaptive layer (Cambia)
npx cambia check                       # validate the Cambia layer
```

Drop in a skill/rule so your agent reads both layers:

```bash
npx cambia skill          # install Claude + Cursor agent rules into this project
npx cambia skill claude   # just Claude  → .claude/skills/cambia/SKILL.md
npx cambia skill cursor   # just Cursor  → .cursor/rules/cambia.mdc
```

`cambia init` is **non-destructive** — it splices a `cambia:` block into your DESIGN.md
without touching, reformatting, or stripping comments from anything else. Use `--dry-run`
to preview the change without writing.

No new file format to learn. Cambia is one extra `cambia:` key in the DESIGN.md you already have.

---

## What it looks like

A normal DESIGN.md, with a `cambia:` block added to the front matter (full file in
[`packages/cli/assets/examples/DESIGN.md`](packages/cli/assets/examples/DESIGN.md)):

```yaml
---
name: Acme Orders
colors: { primary: "#1A1C1E", accent: "#B8422E", ... }
components:
  button-primary: { backgroundColor: "{colors.accent}", ... }
  data-table:     { backgroundColor: "{colors.neutral}", ... }

# --- Cambia extension (ignored by design.md, read by cambia) ---
cambia:
  version: "0.1"
  context: { archetype: analytics }
  roles:
    primary-action: { component: button-primary, conserved: [position-top-right], adaptive: [] }
    tabular-list:   { component: data-table, conserved: [rows-are-records, sort-by-header], adaptive: [density, default-sort] }
---
## Overview
...
```

`@google/design.md lint` passes (custom key tolerated). `cambia check` validates the roles
and cross-references them against the `components` block. One file, two readers. See
[`SPEC.md`](SPEC.md).

---

## Why this shape

The markdown-file-for-agents idea is now an established, Google-backed standard at the
visual layer. Competing there is pointless — so Cambia doesn't. It **adopts DESIGN.md and
extends upward**, into the layers nobody has standardized yet:

1. **Roles** — what plays "the primary action," and which traits are conserved vs plastic.
2. **Born-adapted** — components pre-tuned to the app's archetype.
3. **Personalization** — interfaces that adapt per user, on-device.
4. **Manifestation** — eventually, a portable interface the *user* owns.

Each is an additive layer over the same file. Roles are the hinge between DESIGN.md's static
visual layer and everything living above it — cheap to add today, the foundation for the
rest. The runtime that makes the adaptive traits actually adapt is specified in
[`docs/RFC-L1-adaptive-runtime.md`](docs/RFC-L1-adaptive-runtime.md).

---

## Packages

This is a monorepo. Four packages are published to npm:

| Package | What it is |
| --- | --- |
| [`cambia`](packages/cli) | The CLI — `npx cambia init / check / skill`. |
| [`@cambia/core`](packages/core) | Framework-zero library to read, scaffold, and validate the `cambia:` extension. Embed it in CI or your own tooling. |
| [`@cambia/runtime`](packages/runtime) | **The live engine.** Born-adapted defaults that personalize per user on-device; conserved traits never move. |
| [`@cambia/react`](packages/react) | React binding — the `useCambia` hook over the runtime. |

```
cambia/
├── packages/
│   ├── core/      # @cambia/core    — readFrontMatter, scaffold, validate (no I/O)
│   ├── runtime/   # @cambia/runtime — the live L1 adaptive engine
│   ├── react/     # @cambia/react   — useCambia hook
│   └── cli/       # cambia          — the command + bundled skills/templates/examples
├── docs/          # the L1 adaptive-runtime RFC
├── website/       # landing page (not published)
└── SPEC.md        # Cambia × DESIGN.md integration spec
```

---

## The live engine

Declare which traits are conserved vs adaptive in your DESIGN.md's `cambia:` block, then
let the runtime adapt the adaptive ones per user. Born-adapted from the first render,
personalizing on-device, never touching a conserved trait:

```ts
import { createCambia } from '@cambia/runtime';

const cambia = createCambia({
  designMd,            // your DESIGN.md text (with a cambia: block)
  userId: currentUser, // scopes the local, on-device state
});

const table = cambia.role('tabular-list');
table.values();        // analytics archetype → { density: 'compact', 'default-sort': '__recency__' }

// Feed real usage back. Conserved traits are ignored by construction.
table.observe({ trait: 'density', value: 'comfortable' });
// ...after a clear, repeated pattern, table.values().density becomes 'comfortable' — for this user only.
```

In React:

```tsx
import { createCambia } from '@cambia/runtime';
import { CambiaProvider, useCambia } from '@cambia/react';

const cambia = createCambia({ designMd, userId });

function App() {
  return (
    <CambiaProvider value={cambia}>
      <OrdersTable />
    </CambiaProvider>
  );
}

function OrdersTable() {
  const { values, observe } = useCambia('tabular-list');
  return (
    <DataTable
      density={values.density}                              // adapted value
      defaultSort={values['default-sort']}
      onDensityChange={(d) => observe({ trait: 'density', value: d })}
      onSortChange={(c) => observe({ trait: 'default-sort', value: c })}
      // conserved traits (rows-are-records, sort-by-header, id-pinned-left) are fixed in the component
    />
  );
}
```

Nothing is transmitted: per-user state persists on-device (in-memory by default,
`createLocalStorageStore()` in the browser, or bring your own store). See the design in
[`docs/RFC-L1-adaptive-runtime.md`](docs/RFC-L1-adaptive-runtime.md).

---

## Validating in CI

```ts
import { validate, scaffold } from '@cambia/core';

const result = validate(designMdText);
if (result.errors.length) { /* fail CI */ }

const { text } = scaffold(designMdText); // non-destructive: returns new file content
```

---

## Known gaps

There is **no automatic DESIGN.md ↔ Tailwind bridge** today. Cambia validates the role
layer but does not read or emit `tailwind.config`; keeping DESIGN.md tokens and a Tailwind
theme aligned is currently manual (or the agent's job via the skill). A `cambia tailwind`
codegen/drift-lint command is a natural future addition — see [`SPEC.md`](SPEC.md#known-gaps--roadmap).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Built on DESIGN.md (Apache-2.0). Cambia is MIT.
