# Cambia × DESIGN.md — integration spec (v0.1)

Cambia is **not a competing file format.** It is an extension to Google's
[DESIGN.md](https://github.com/google-labs-code/design.md). DESIGN.md describes how a
design system **looks** (tokens + rationale). Cambia adds what components **do** (semantic
roles) and, optionally, what may **personalize per user** (adaptive) — and a runtime that
makes those layers live.

> **Cambia** — plural of *cambium*, the thin living layer of a tree where all new growth
> happens, a layer on top of existing structure; and "it changes" in Italian/Spanish. A
> growth layer that changes — which is exactly what this is, riding on top of DESIGN.md.

## The layer stack

| Layer | Owned by | Lives in | Buys you |
| --- | --- | --- | --- |
| **L0 — visual identity** | DESIGN.md (Google) | front-matter tokens + prose | agent builds on-brand |
| **L0.5 — semantic roles** | Cambia | `cambia.roles` in the same file | agent builds with the right component for the job; conserved/plastic is declared |
| **L1 — born-adapted + personalization** | `@epode/cambia-runtime` | `cambia.context` + priors, on-device | components arrive tuned to the archetype and adapt per user, locally |
| **L2 — richer inference** | Cambia runtime | on-device | cross-trait / cross-role factors over the same estimator |
| **L3–L4 — manifestation** | Cambia runtime | a user-owned genome | per-person, cross-app interfaces |

DESIGN.md owns L0. Cambia owns everything above it. You adopt DESIGN.md as-is and extend it.

## How Cambia rides inside DESIGN.md

DESIGN.md is designed to tolerate extension: it preserves unknown sections and stays
silent on custom top-level keys. Cambia uses that on purpose.

- **One top-level key, `cambia:`**, in the YAML front matter — the machine-readable layer.
- **An optional `## Adaptation` section** in the markdown body — human rationale.

A file with a `cambia:` block:
- **passes `npx @google/design.md lint`** unchanged (the key is ignored), and
- **is read more deeply by `npx @epode/cambia check`** (which validates roles and cross-references
  them against the DESIGN.md `components`).

You never fork the file. One DESIGN.md, two readers.

## The `cambia:` block

```yaml
cambia:
  version: "0.1"
  context:
    archetype: analytics
  roles:
    <role-name>:
      component: <must match a DESIGN.md components key>
      conserved: [<trait>, ...]   # the grammar — never moves
      adaptive:  [<trait>, ...]   # the only traits the runtime may personalize
```

- **Roles** are keyed to canonical semantic names (`primary-action`, `tabular-list`,
  `form-field`, `container`, `status`, `nav`, …) so learning transfers across systems.
- **`component`** must resolve to a key in DESIGN.md's `components:` block.
- **Default everything to conserved.** Adaptive is opt-in, trait by trait.

## Conformance

A Cambia extension is **valid** if `cambia.roles` is a map and every `component` it
references exists in the DESIGN.md `components` block. `npx @epode/cambia check` enforces this and
warns on traits listed as both conserved and adaptive, non-canonical role names, or an
unfilled scaffold (a `TODO` component / archetype left from `cambia init`).

The visual layer is validated separately by `npx @google/design.md lint`. The two tools are
complementary by design.

## Why roles are the hinge

L0 (DESIGN.md) is now a Google-backed commodity — and that's good. The value, and the
defensibility, is everything above it. **Roles are the bridge:** DESIGN.md says what a
button looks like; a role says what plays "the primary action" and which of its traits are
conserved vs plastic. That semantic + conserved/plastic layer is what every higher layer
(born-adapted, personalization, manifestation) is built on. It costs almost nothing to add
to a DESIGN.md today, and it's the down payment on the entire roadmap.

## Known gaps & roadmap

- **DESIGN.md ↔ Tailwind bridge** — implemented via `cambia tailwind`: it generates a
  Tailwind `theme` fragment from DESIGN.md tokens (colors, spacing, `rounded` → `borderRadius`,
  typography → `fontSize`/`fontFamily`), and `--check` re-generates and diffs against a
  committed file to catch drift in CI. The generator lives in `@epode/cambia-core`
  (`tokensToTailwind` / `renderTailwindTheme`). DESIGN.md remains the single source of truth;
  the bridge does not yet parse a hand-written `tailwind.config.js` (it diffs the generated artifact).
- **L1 adaptive runtime** — specified in [`docs/RFC-L1-adaptive-runtime.md`](docs/RFC-L1-adaptive-runtime.md)
  and **implemented** in [`@epode/cambia-runtime`](packages/runtime) (with a React binding in
  [`@epode/cambia-react`](packages/react)): born-adapted defaults that personalize per user on-device,
  never touching conserved traits. Layers L2–L4 (cross-trait factors, shared learning, a
  user-owned cross-app genome) remain future work.

> The full Cambia architecture — the factor-graph genome, the adaptation loop, promotion, the
> user-owned genome, and per-person manifestation — sits on top of a DESIGN.md-based L0. The
> roles layer shipped here is the foundation the rest builds on.
