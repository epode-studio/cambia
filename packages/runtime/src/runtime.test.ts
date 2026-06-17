import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCambia, createMemoryStore, Trait } from './index.js';

const ANALYTICS_DESIGN = `---
name: Acme Orders
components:
  data-table: {}
  button-primary: {}
cambia:
  version: "0.1"
  context:
    archetype: analytics
  roles:
    tabular-list:
      component: data-table
      conserved: [rows-are-records, sort-by-header, id-pinned-left]
      adaptive: [density, default-sort]
    primary-action:
      component: button-primary
      conserved: [position-top-right]
      adaptive: []
---
# Acme
`;

const CRUD_DESIGN = ANALYTICS_DESIGN.replace('archetype: analytics', 'archetype: crud');

// --- Born-adapted: a brand-new user starts on the archetype default --------
test('born-adapted: analytics table starts compact, sorted by recency', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'alice' });
  const v = c.role('tabular-list').values();
  assert.equal(v.density, 'compact');
  assert.equal(v['default-sort'], '__recency__');
});

test('born-adapted: crud table starts comfortable (different prior)', () => {
  const c = createCambia({ designMd: CRUD_DESIGN, userId: 'bob' });
  assert.equal(c.role('tabular-list').value('density'), 'comfortable');
});

// --- Conserved invariance: conserved traits are not in the model -----------
test('conserved traits are never adaptive and observing them is a no-op', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'alice' });
  const role = c.role('tabular-list');
  assert.equal(role.isAdaptive('rows-are-records'), false);
  assert.equal(role.value('rows-are-records'), undefined);
  // Trying to adapt a conserved trait changes nothing.
  const before = role.values().density;
  role.observe({ trait: 'sort-by-header', value: 'whatever' });
  assert.equal(role.values().density, before);
});

test('a role with no adaptive traits exposes nothing to adapt', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'alice' });
  assert.deepEqual(c.role('primary-action').values(), {});
});

// --- Anti-thrash: one stray signal never flips the interface ---------------
test('anti-thrash: a clear majority is required before the value switches', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'carol' });
  const role = c.role('tabular-list');
  // analytics prior: compact 3, comfortable 1. Need comfortable score > 3 * 1.5 = 4.5.
  role.observe({ trait: 'density', value: 'comfortable' }); // 2 vs 3
  assert.equal(role.value('density'), 'compact');
  role.observe({ trait: 'density', value: 'comfortable' }); // 3 vs 3
  assert.equal(role.value('density'), 'compact');
  role.observe({ trait: 'density', value: 'comfortable' }); // 4 vs 3 — ahead but not clearly
  assert.equal(role.value('density'), 'compact', 'must not thrash on a slim lead');
  role.observe({ trait: 'density', value: 'comfortable' }); // 5 vs 3 > 4.5 — switch
  assert.equal(role.value('density'), 'comfortable');
});

// --- Personalization persists and is per-user ------------------------------
test('personalization persists across engine instances via the store', () => {
  const store = createMemoryStore();
  const a = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'dave', store });
  const role = a.role('tabular-list');
  for (let i = 0; i < 4; i++) role.observe({ trait: 'density', value: 'comfortable' });
  assert.equal(role.value('density'), 'comfortable');

  // A fresh engine over the same store + user reloads the personalized value.
  const b = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'dave', store });
  assert.equal(b.role('tabular-list').value('density'), 'comfortable');

  // A different user on the same store still gets the born-adapted default.
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'erin', store });
  assert.equal(c.role('tabular-list').value('density'), 'compact');
});

// --- Subscriptions fire on change (binding surface) ------------------------
test('subscribers are notified only when the value actually changes', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'frank' });
  const role = c.role('tabular-list');
  let fires = 0;
  const unsub = role.subscribe(() => fires++);
  role.observe({ trait: 'density', value: 'comfortable' }); // no switch yet
  assert.equal(fires, 0);
  for (let i = 0; i < 3; i++) role.observe({ trait: 'density', value: 'comfortable' });
  assert.equal(fires, 1, 'one notification on the single switch');
  unsub();
  for (let i = 0; i < 4; i++) role.observe({ trait: 'density', value: 'compact' });
  assert.equal(fires, 1, 'no notifications after unsubscribe');
});

// --- values() snapshot identity is stable (required by useSyncExternalStore)
test('values() returns a stable reference until something changes', () => {
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'grace' });
  const role = c.role('tabular-list');
  const snap1 = role.values();
  role.observe({ trait: 'density', value: 'comfortable' }); // no switch
  assert.equal(role.values(), snap1, 'same reference when nothing changed');
  for (let i = 0; i < 3; i++) role.observe({ trait: 'density', value: 'comfortable' });
  assert.notEqual(role.values(), snap1, 'new reference after a change');
});

// --- Quiet by success: once corrections stop, the value stabilizes ---------
test('the kernel goes quiet once the user stops correcting', () => {
  const t = new Trait({ compact: 3, comfortable: 1 }, {}, 1.5);
  assert.equal(t.value(), 'compact');
  for (let i = 0; i < 4; i++) t.observe('comfortable');
  assert.equal(t.value(), 'comfortable');
  // No further observations → value holds.
  assert.equal(t.value(), 'comfortable');
});

// --- forget(): the right to erasure ----------------------------------------
test('forget() resets live state to born-adapted and clears the store', () => {
  const store = createMemoryStore();
  const c = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'heidi', store });
  const role = c.role('tabular-list');
  let fires = 0;
  role.subscribe(() => fires++);
  for (let i = 0; i < 4; i++) role.observe({ trait: 'density', value: 'comfortable' });
  assert.equal(role.value('density'), 'comfortable');

  c.forget();
  assert.equal(role.value('density'), 'compact', 'snaps back to the born-adapted default');
  assert.equal(store.get('heidi:tabular-list:density'), null, 'store entry removed');
  assert.ok(fires >= 2, 'subscribers notified on the revert');

  // A fresh engine over the same store confirms nothing personalized persisted.
  const c2 = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'heidi', store });
  assert.equal(c2.role('tabular-list').value('density'), 'compact');
});

test("forget(otherUser) clears that user's stored state without touching live state", () => {
  const store = createMemoryStore();
  const me = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'me', store });
  for (let i = 0; i < 4; i++) me.role('tabular-list').observe({ trait: 'density', value: 'comfortable' });

  // personalize another user via their own engine on the shared store
  const them = createCambia({ designMd: ANALYTICS_DESIGN, userId: 'them', store });
  for (let i = 0; i < 4; i++) them.role('tabular-list').observe({ trait: 'density', value: 'comfortable' });

  me.forget('them');
  assert.equal(store.get('them:tabular-list:density'), null, "the other user's state is erased");
  assert.equal(me.role('tabular-list').value('density'), 'comfortable', 'my live state is untouched');
});
