# RFC: Cambia L1 — The Adaptive Runtime

**Status:** Implemented in [`@cambia/runtime`](../packages/runtime) (+ [`@cambia/react`](../packages/react)) · **Layer:** L1 (the first *running* layer) · **Depends on:** DESIGN.md + the `cambia:` extension (L0)
*Author: Paul Nylund (Epode)*

---

## Summary

L0 is description: a DESIGN.md plus a `cambia:` block declaring, per role, which traits are **conserved** and which are **adaptive**. This RFC specifies the runtime that makes the adaptive traits actually adapt — starting each user at a sensible default and personalizing on-device as they use the app, while never touching a conserved trait.

It is deliberately the *simplest thing that is genuinely living*: one small estimator per adaptive trait, local-first, no server. The richer machinery (factor graphs, promotion, manifestation) is the forward-compatible generalization of this — but none of it is needed to ship L1.

## Why L1 is the core

L0 is now a Google-backed commodity (DESIGN.md) plus a thin role layer. Everything that makes Cambia *differentiated* begins here: this is where an interface stops being a static description and becomes something that fits the person using it. Born-adapted defaults and per-user personalization are **the same estimator at two evidence levels** — the prior is the born-adapted default, the posterior is the personalized state. So one mechanism delivers both. That estimator is the core of the entire project; everything above L1 is a richer version of it.

## Goals

1. Read the `cambia:` adaptive traits and produce, per role, a set of adapted parameter values.
2. **Born-adapted from the first render** — start at a context-conditioned default, before the user has done anything.
3. **Personalize on-device** — move the values toward the user as they reveal preferences, with no network.
4. **Never touch conserved traits.** Safety is structural: conserved traits are not in the runtime's vocabulary.
5. **Dead simple to implement and adopt** — a hook and an `observe()` call.

## Non-goals (scope boundaries)

L1 explicitly does **not** include:
- **Promotion / shared learning / any network.** Nothing leaves the device. (That's L3.)
- **A user-owned, portable, cross-app genome.** (That's L4.)
- **Factor-graph machinery** beyond a flat per-trait estimate — no composition factors, loop closure, or fixed-lag smoothing yet.
- **Structural change.** Only the declared adaptive parameters vary, always within the conserved grammar.

Keeping these out is what makes L1 shippable and safe.

## Design overview — the loop

On the client, for each role with adaptive traits:

1. **Load** the user's local estimate for each adaptive trait — or, if none exists yet, the **born-adapted prior** for the trait given `cambia.context.archetype`.
2. **Apply** the current value to the component (via a hook).
3. **Observe** signals as the user interacts (they sort a column, toggle density, invoke an action).
4. **Update** the estimate online and **persist** it locally.
5. Conserved traits are never read, observed, or written.

That's the entire runtime. Born-adapted is step 1 with no history; personalization is steps 3–4 accumulating.

## Data model

Per `(user × role × adaptive-trait)`, a small estimate. For a **discrete** trait (most adaptive traits are discrete choices — density ∈ {comfortable, compact}, default-sort ∈ columns, promoted-action ∈ actions):

- a map of **observed counts** per option,
- a **prior** expressed as pseudo-counts (the born-adapted default, weighted by confidence),
- a **current value**.

This is a Dirichlet-multinomial estimate. New user → the prior dominates → born-adapted default. As observations accumulate → the user overcomes the prior → personalized. Shrinkage and born-adapted safety fall out for free.

> Relationship to the committed architecture: this is a **degenerate factor graph** — one variable per trait, a prior factor, and measurement factors; MAP inference is `argmax`. The full factor graph (v0.3) generalizes it with cross-trait and cross-role factors. L1 is that graph with the edges removed, which is why L1 needs none of the heavy machinery yet stays forward-compatible.

## The adaptation rule

One rule, with an anti-thrash guard so the interface never flickers:

```ts
score(option)   = prior[option] + observed[option]
current value   = the option with the highest score
switch only if  score(best) > score(current) × switchMargin   // e.g. 1.5
```

The `switchMargin` means a new winner must *clearly* beat the incumbent before the interface changes — one stray click never flips anything. Combined with prior pseudo-counts, a brand-new user sits firmly on the born-adapted default and only moves once a real pattern emerges. The fitness signal is implicit and correct: when the user stops correcting, `observed` stops growing, the value stabilizes, and adaptation goes quiet — exactly the target.

## Drivers (how traits get observed)

Canonical adaptive traits ship with **built-in drivers** — the runtime already knows their option space, prior, and what event updates them:

| Trait | Options | Updated by |
| --- | --- | --- |
| `density` | comfortable, compact | explicit density change (or viewport heuristic) |
| `default-sort` | the table's columns | a sort event |
| `promoted-action` | the row's actions | an action invocation |

Declaring `adaptive: [density, default-sort]` is therefore zero-config — the runtime has batteries included. A **custom trait** supplies its own options, prior, and is fed via `observe()`.

## Born-adapted priors (cold start, no trained genome)

L1 does not require a community genome (that needs promotion, which is L3). Priors come from a small **built-in table** keyed by canonical trait × archetype, shipped with the runtime:

```yaml
analytics:
  density:      { compact: 3, comfortable: 1 }     # dense by default
  default-sort: { __recency__: 2 }                  # newest first
crud:
  density:      { comfortable: 3, compact: 1 }
```

`cambia.context.archetype` selects the row; absent an archetype, a generic prior is used. Optionally, an app with existing analytics can **replay** its history through the same estimator once to warm-start the priors with its own users' behavior (the DB-as-latent-genome bootstrap) — but that's optional polish, not required to ship.

## API

A framework-zero core plus thin bindings. React first.

```ts
// Core (headless)
const cambia = createCambia({
  designMd,           // the DESIGN.md text (or a parsed cambia object)
  userId,             // scopes the local state
  store,              // pluggable local store; defaults to IndexedDB
});

const role = cambia.role('tabular-list');
role.values();                       // { density, defaultSort, promotedAction }
role.observe({ trait: 'default-sort', value: 'createdAt' });
```

```tsx
// React binding
import { useCambia } from '@cambia/react';

function OrdersTable({ rows }) {
  const { density, defaultSort, promotedAction, observe } = useCambia('tabular-list');

  return (
    <DataTable
      rows={rows}
      // adapted values (born-adapted prior → personalized over time)
      density={density}
      defaultSort={defaultSort}
      promotedAction={promotedAction}
      // feed signals back; conserved traits are simply never passed here
      onSortChange={(col) => observe({ trait: 'default-sort', value: col })}
      onActionInvoke={(a) => observe({ trait: 'promoted-action', value: a })}
      onDensityChange={(d) => observe({ trait: 'density', value: d })}
    />
  );
}
```

The integration surface is one hook returning adapted values plus an `observe` callback. Conserved traits never appear in the hook, so they can't be adapted by construction.

## Storage & privacy

- Per-user estimates persist **on-device** (IndexedDB by default; pluggable). For apps with accounts, they may sync via the app's *own* user store, under the app's *own* policy.
- **Nothing is transmitted by L1.** No telemetry endpoint, no shared genome. This is why L1 is safe to drop into any app: in the worst case, a user's table gets slightly denser for them, locally.

## Convergence & safety

- **Anti-thrash:** the `switchMargin` prevents flicker; the interface only changes on clear, repeated signal.
- **Shrinkage:** prior pseudo-counts keep new users on the safe default.
- **Conserved invariance:** conserved traits are outside the runtime's data model — not adaptable even in principle.
- **Quiet by success:** when corrections stop, adaptation stops.

## Worked example

An analytics app's orders table. First load: `density = compact`, `defaultSort = createdAt` (the analytics prior) — already sensible, no history. This user always re-sorts by `total` and switches to comfortable. After a handful of sessions, their `default-sort` estimate crosses the switch margin → the table opens sorted by `total`, comfortable, *for them only*. A new colleague opening the same app still gets the compact, recency-sorted default. The grammar — rows are records, click-to-sort, ID pinned left — never moved for either of them.

## Forward-compatibility

This runtime grows into the rest of Cambia without rework:
- **L2 enrichment:** add edges to the graph (composition factors, fixed-lag smoothing, loop closure) — the per-trait estimates become connected variables.
- **L3:** marginalize a user's estimates into a de-identified residual and send it to a shared genome (promotion).
- **L4:** lift the local state into a portable, user-owned genome and compose capabilities into it (manifestation).

At every step the L1 estimator is the kernel; later layers add structure around it. Nothing here is throwaway.

## Open questions

- **Density driver without an explicit toggle** — is a viewport/scroll heuristic worth it, or require an explicit control?
- **Per-trait switch margins** — global default vs per-trait tuning (a default-sort flip is cheaper than a density flip).
- **Multi-device, no account** — accept divergence per device, or offer an opt-in local export to move state?
- **Prior table governance** — where the built-in archetype priors live and how they're updated before any community genome exists.
- **Observe ergonomics** — explicit `observe()` (clear, in this RFC) vs optional auto-instrumentation of standard component events.

## Reference implementation (the kernel, ~30 lines)

```ts
type Counts = Record<string, number>;

class Trait {
  current: string;
  constructor(
    private prior: Counts,            // born-adapted prior (pseudo-counts)
    private observed: Counts = {},
    private switchMargin = 1.5,
  ) {
    this.current = argmax(prior);     // start born-adapted
  }

  value() { return this.current; }

  observe(option: string) {
    this.observed[option] = (this.observed[option] ?? 0) + 1;
    const s = this.score();
    const best = argmax(s);
    if (best !== this.current && s[best] > s[this.current] * this.switchMargin) {
      this.current = best;            // switch only on clear, repeated signal
    }
  }

  private score(): Counts {
    const s: Counts = { ...this.prior };
    for (const k in this.observed) s[k] = (s[k] ?? 0) + this.observed[k];
    return s;
  }

  serialize() { return { observed: this.observed, current: this.current }; }
}

function argmax(c: Counts) {
  return Object.keys(c).reduce((a, b) => (c[b] > (c[a] ?? -Infinity) ? b : a));
}
```

Born-adapted, personalizing, shrinking, and thrash-proof — in one small class. That is the core of Cambia.
