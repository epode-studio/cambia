---
name: cambia
description: Build UI on-system using DESIGN.md (visual identity) plus its Cambia extension (semantic roles, and which traits adapt). Read both before generating or editing UI.
---

# Build on-system with DESIGN.md + Cambia

When asked to create or modify any UI:

1. **Read `DESIGN.md`** at the project root.
2. **Apply the visual layer** (DESIGN.md front-matter tokens + prose): colors, typography, spacing, rounding, and component styling. Build exactly to the tokens.
3. **Apply the Cambia layer** (the `cambia:` block in the same file), if present:
   - Use components for the **role** they're mapped to (`primary-action`, `tabular-list`, `form-field`, …).
   - Treat each role's **`conserved`** traits as fixed — never change them (e.g. tables: rows are records, sort by header, ID pinned left).
   - The **`adaptive`** traits are the only things allowed to vary per user.
   - Honor `cambia.context.archetype` (e.g. analytics → favor density).
4. If you need a role or component that isn't covered, **say so and propose adding it** to DESIGN.md / the `cambia:` block — don't hand-roll off-system UI.

Note: DESIGN.md tokens are the single source of truth for visual values. If the project uses Tailwind, generate the theme from DESIGN.md with `npx @epode/cambia tailwind --out cambia.theme.js` (and `npx @epode/cambia tailwind --check <file>` in CI) rather than hand-mirroring tokens.

If there's no `cambia:` block, follow the DESIGN.md visual layer and offer to add roles. If there's no DESIGN.md at all, offer to create one (see `npx @google/design.md spec`).
