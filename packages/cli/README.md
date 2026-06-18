# @epode/cambia

**The Cambia CLI** — a [DESIGN.md](https://github.com/google-labs-code/design.md) extension
that makes a design system **role-aware** and (optionally) **adaptive**.

```bash
npx @epode/cambia init      # add a cambia: block to your DESIGN.md (non-destructive)
npx @epode/cambia check     # validate it
npx @epode/cambia tailwind --out cambia.theme.js   # DESIGN.md tokens → a Tailwind theme
npx @epode/cambia skill     # install an agent rule (Claude / Cursor)
```

Cambia adds **roles** (what each component *does*) and, per role, which traits are
**conserved** (the grammar — never moves) vs **adaptive** (the runtime may personalize). A
companion runtime ([`@epode/cambia-runtime`](https://www.npmjs.com/package/@epode/cambia-runtime))
then personalizes the adaptive traits per user, **on-device**.

It rides inside the DESIGN.md you already have as one top-level `cambia:` key, so the file
still passes `npx @google/design.md lint` and is read more deeply by `cambia check`.

## Commands

| Command | What it does |
| --- | --- |
| `init [--file F] [--dry-run]` | splice a `cambia:` block into a DESIGN.md (preserves comments/format) |
| `check [F]` | validate roles + cross-reference components |
| `tailwind [--out F] [--check F] [--format esm\|cjs\|json]` | generate / drift-check a Tailwind theme from tokens |
| `skill [claude\|cursor]` | install the agent rule into your project |

## Links

- Repo & docs: https://github.com/epode-studio/cambia
- Spec: https://github.com/epode-studio/cambia/blob/main/SPEC.md

MIT
