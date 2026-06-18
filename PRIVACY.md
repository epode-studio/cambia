# Privacy

Cambia's runtime (`@epode/cambia-runtime`) personalizes interfaces **on the device**. This
document states exactly what it stores, where, and how to erase it.

## What is stored

For each user, per role, per **adaptive** trait, the runtime keeps a small estimate:

- a map of **observed counts** per option (e.g. `{ "comfortable": 5, "compact": 3 }`), and
- the **current chosen value** (e.g. `"comfortable"`).

That's all. There is **no** event log, no timestamps, no history of individual actions, no
mouse/scroll/dwell tracking, and no personally identifying information beyond the `userId`
*you* choose to scope state with. Conserved traits are never stored — they aren't in the
model.

Storage keys look like `‹userId›:‹role›:‹trait›`.

## Where it is stored

Wherever the `store` you pass to `createCambia({ store })` puts it:

- **Default:** in memory (`createMemoryStore`) — gone when the page/process ends.
- **Browser:** `createLocalStorageStore()` — on the user's device, in `localStorage`.
- **Your own store:** anything implementing `get`/`set`/`remove`.

## What is transmitted

**Nothing.** The runtime makes no network calls — no telemetry endpoint, no shared server,
no analytics. Personalization never leaves the device unless *you* sync your chosen store
elsewhere.

## Erasure — `cambia.forget()`

```ts
const cambia = createCambia({ designMd, userId: 'alice', store });

cambia.forget();          // erase THIS user: clears the store AND reverts the live UI to
                          // born-adapted defaults, notifying React subscribers immediately.

cambia.forget('bob');     // erase another user's persisted state in the shared store
                          // (best-effort; does not touch the current engine's live state).
```

After `forget()`, the user's stored estimates are deleted and every adaptive trait falls
back to the born-adapted default. There is nothing else to delete.

## GDPR / data-protection posture

Cambia is **privacy-preserving by construction**, which makes compliance straightforward —
but compliance is a property of *your application*, not of a library:

- **Data minimization** — only small per-trait tallies exist; no profiles, no logs.
- **No transmission** — nothing is sent anywhere by the runtime.
- **Purpose limitation** — the data exists solely to choose a UI default.
- **Right to erasure** — `forget()` deletes a user's state in one call.
- **Your responsibilities** — if you pass a real `userId` and persist via a store you sync
  to a backend, that persisted preference becomes personal data under your control: you own
  the lawful basis, retention, and access/erasure handling. The default in-memory /
  `localStorage` paths keep state local and trivially erasable.

This document is engineering guidance, not legal advice — confirm specifics with your DPO.
