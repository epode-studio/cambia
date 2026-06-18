# @epode/cambia-runtime

The **live, on-device engine** for [Cambia](https://github.com/epode-studio/cambia). Each
component starts *born-adapted* to the app's archetype, then **personalizes per user** as you
feed it the choices they make — while **conserved traits never move**. Nothing is transmitted.

```bash
npm i @epode/cambia-runtime
```

## Usage

```ts
import { createCambia, createLocalStorageStore } from '@epode/cambia-runtime'

const cambia = createCambia({
  designMd,                          // your DESIGN.md text (with a cambia: block)
  userId: 'alice',                   // scopes the local, on-device state
  store: createLocalStorageStore(),  // optional; defaults to in-memory
})

const table = cambia.role('tabular-list')
table.values()                                    // born-adapted → personalized values
table.observe({ trait: 'density', value: 'comfortable' })
// ...after a clear, repeated pattern, values().density switches — for this user only.

cambia.forget()                                   // erase this user's state (GDPR right to erasure)
```

How it adapts: a small Dirichlet-multinomial estimate per adaptive trait (prior = born-adapted
default; observations move it), with an anti-thrash `switchMargin` so one stray signal never
flips the UI. Conserved traits aren't in the model, so they can't change. See the
[RFC](https://github.com/epode-studio/cambia/blob/main/docs/RFC-L1-adaptive-runtime.md).

For React, use [`@epode/cambia-react`](https://www.npmjs.com/package/@epode/cambia-react). MIT.
