# Personalize your UI for each user — automatically and privately

**`@epode/cambia-runtime`** makes your app's interface **adapt to each person who uses it**. It
starts every user with a sensible default, then quietly tailors the parts you allow — like
table density or default sort — based on the choices they actually make. The parts you mark as
fixed never change, so the app always feels familiar.

Everything happens **on the user's device**. No accounts, no tracking, nothing sent to a server.

```bash
npm i @epode/cambia-runtime
```

## Quick start

```ts
import { createCambia, createLocalStorageStore } from '@epode/cambia-runtime'

const cambia = createCambia({
  designMd,                          // your DESIGN.md (describes your design system)
  userId: 'alice',                   // keeps each user's preferences separate
  store: createLocalStorageStore(),  // saves in the browser; optional
})

const table = cambia.role('tabular-list')

table.values()                                    // the settings to render with, tailored to this user
table.observe({ trait: 'density', value: 'comfortable' })  // tell it what the user chose
// After a clear, repeated pattern, the table adapts for this user only.

cambia.forget()                                   // erase this user's preferences (e.g. for GDPR)
```

## Why teams use it

- **Better UX with zero effort from users** — the interface fits each person over time.
- **Privacy-friendly** — preferences stay on the device; there's nothing to track or breach, and
  `forget()` deletes a user's data in one call.
- **Safe to adopt** — only the parts you opt in can change; your core layout stays put.
- **Tiny and framework-agnostic** — plain functions; use it anywhere. For React, add
  [`@epode/cambia-react`](https://www.npmjs.com/package/@epode/cambia-react).

Part of [Cambia](https://github.com/epode-studio/cambia). Free and open source (MIT).
