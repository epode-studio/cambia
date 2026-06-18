# Cambia — make your UI adapt to each user

**`@epode/cambia`** is a command-line tool that lets your app's interface **personalize itself
for every user** — automatically, and privately on their device. It builds on
[DESIGN.md](https://github.com/google-labs-code/design.md), the simple Markdown file that
describes your design system.

```bash
npx @epode/cambia init      # add adaptive settings to your DESIGN.md
npx @epode/cambia check     # make sure they're valid
npx @epode/cambia tailwind --out theme.js   # turn your design tokens into a Tailwind theme
npx @epode/cambia skill     # set up your AI coding assistant (Claude / Cursor)
```

## What it does

You label, once, **what each component is** (a table, a primary button, a form field…) and
**which parts are allowed to change per person** (like row density or default sort) versus what
should always stay the same. From then on, the companion runtime quietly tailors those parts to
each user as they use your app — no dashboards, no setup for the user, and nothing sent to a
server.

- **Adapts to each user** — the interface fits how each person actually works.
- **Private by default** — preferences live on the device; nothing is tracked or transmitted.
- **One small file** — it all lives in the `DESIGN.md` you already have.
- **Works with your AI tools** — drop in a rule so Claude or Cursor build to your design system.

## Commands

| Command | What it does |
| --- | --- |
| `init` | add the adaptive block to your DESIGN.md (keeps your file intact) |
| `check` | validate it |
| `tailwind` | generate a Tailwind theme from your design tokens (and catch drift in CI) |
| `skill` | install an AI assistant rule (Claude / Cursor) |

## Learn more

- Website & docs: https://github.com/epode-studio/cambia
- How it works: https://github.com/epode-studio/cambia/blob/main/SPEC.md

Free and open source (MIT).
