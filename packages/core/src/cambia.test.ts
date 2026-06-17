import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFrontMatter, scaffold, spliceBlock, validate } from './index.js';

const ANALYTICS = `---
name: Acme Analytics
colors:
  primary: "#1a73e8"
components:
  button-primary: { bg: primary }
  data-table: { rows: striped }
  field: { border: neutral }
  button-primary-hover: { bg: primary-dark }
---
# Acme
Body text here.
`;

// --- Scenario 2: init infers roles on a typical DESIGN.md -------------------
test('scaffold infers roles and skips variant entries', () => {
  const r = scaffold(ANALYTICS);
  assert.equal(r.alreadyPresent, false);
  assert.equal(r.usedPlaceholder, false);
  const roles = r.mapped.map((m) => `${m.component}:${m.role}`).sort();
  assert.deepEqual(roles, ['button-primary:primary-action', 'data-table:tabular-list', 'field:form-field'].sort());
  // The -hover variant must not become its own role.
  assert.ok(!r.mapped.some((m) => m.component.endsWith('-hover')));
});

// --- Fix #2: init is NON-DESTRUCTIVE ----------------------------------------
test('scaffold preserves all other lines byte-for-byte (comments, flow style, quotes)', () => {
  const r = scaffold(ANALYTICS);
  const original = ANALYTICS.split('\n');
  const result = r.text.split('\n');
  // Every original line must still appear, unchanged, in order.
  let oi = 0;
  for (const line of result) {
    if (oi < original.length && line === original[oi]) oi++;
  }
  assert.equal(oi, original.length, 'every original line should be preserved verbatim');
  // Specifically: flow style and quoting untouched.
  assert.ok(r.text.includes('  button-primary: { bg: primary }'));
  assert.ok(r.text.includes('  primary: "#1a73e8"'));
});

test('scaffold result round-trips and parses; cambia block is present', () => {
  const r = scaffold(ANALYTICS);
  const { frontMatter } = readFrontMatter(r.text);
  assert.ok(frontMatter?.cambia);
  assert.equal(frontMatter.cambia.version, '0.1');
  assert.ok(frontMatter.cambia.roles['tabular-list']);
});

// --- Scenario 2 (cont): init -> check is clean ------------------------------
test('scaffold output validates clean', () => {
  const r = scaffold(ANALYTICS);
  const v = validate(r.text);
  assert.equal(v.errors.length, 0);
  assert.equal(v.hasCambia, true);
  assert.equal(v.roleCount, 3);
});

// --- Fix #1: scaffold with no inferable roles still passes check -------------
test('scaffold with no components uses a placeholder and check WARNS (no error)', () => {
  const src = `---\nname: Empty\ncolors:\n  primary: "#000"\n---\n# Empty\n`;
  const r = scaffold(src);
  assert.equal(r.usedPlaceholder, true);
  const v = validate(r.text);
  assert.equal(v.errors.length, 0, 'placeholder scaffold must not be a hard error');
  assert.ok(v.warnings.some((w) => w.includes('unfilled scaffold')));
});

test('scaffold with only unmappable components reports them and still validates', () => {
  const src = `---\nname: Weird\ncomponents:\n  doohickey: {}\n  sparkline: {}\n---\n# Weird\n`;
  const r = scaffold(src);
  assert.deepEqual(r.unmapped.sort(), ['doohickey', 'sparkline']);
  assert.equal(validate(r.text).errors.length, 0);
});

// --- Scenario 3: idempotency ------------------------------------------------
test('scaffold is idempotent when a cambia block already exists', () => {
  const r1 = scaffold(ANALYTICS);
  const r2 = scaffold(r1.text);
  assert.equal(r2.alreadyPresent, true);
  assert.equal(r2.text, r1.text);
});

// --- Scenario 5: no front matter --------------------------------------------
test('scaffold throws on a file without front matter', () => {
  assert.throws(() => scaffold('# just markdown\nno front matter\n'), /front matter/);
});

test('validate reports no front matter rather than throwing', () => {
  const v = validate('# just markdown\n');
  assert.equal(v.hasFrontMatter, false);
  assert.equal(v.errors.length, 0);
});

// --- Fix #3: CRLF preservation ----------------------------------------------
test('scaffold preserves CRLF line endings', () => {
  const crlf = '---\r\nname: CRLF\r\ncomponents:\r\n  button-go: {}\r\n---\r\n# CRLF\r\n';
  const r = scaffold(crlf);
  assert.ok(r.text.includes('\r\n'), 'output should keep CRLF');
  assert.ok(!/[^\r]\n/.test(r.text), 'no bare LF should be introduced');
  assert.equal(validate(r.text).errors.length, 0);
});

// --- Scenario 9: conserved/adaptive conflict warning ------------------------
test('validate warns when a trait is both conserved and adaptive', () => {
  const src = `---\nname: T\ncomponents:\n  data-table: {}\ncambia:\n  version: "0.1"\n  context: { archetype: analytics }\n  roles:\n    tabular-list:\n      component: data-table\n      conserved: [density, rows-are-records]\n      adaptive: [density]\n---\n# T\n`;
  const v = validate(src);
  assert.equal(v.errors.length, 0);
  assert.ok(v.warnings.some((w) => w.includes('BOTH conserved and adaptive')));
});

// --- Scenario 10: custom role -> info ---------------------------------------
test('validate flags non-canonical roles as info, not error', () => {
  const src = `---\nname: C\ncomponents: { thingy: {} }\ncambia:\n  roles:\n    my-custom-role:\n      component: thingy\n---\n# C\n`;
  const v = validate(src);
  assert.equal(v.errors.length, 0);
  assert.ok(v.info.some((i) => i.includes('custom')));
});

// --- Scenario 13: roles not a map -> error ----------------------------------
test('validate errors when cambia.roles is not a map', () => {
  const src = `---\nname: R\ncomponents: { x: {} }\ncambia:\n  roles: "oops a string"\n---\n# R\n`;
  const v = validate(src);
  assert.ok(v.errors.some((e) => e.includes('not a map')));
});

// --- cross-ref error for a real (non-placeholder) dangling component --------
test('validate errors on a real component reference that does not exist', () => {
  const src = `---\nname: X\ncomponents: { real-button: {} }\ncambia:\n  roles:\n    primary-action:\n      component: ghost-button\n---\n# X\n`;
  const v = validate(src);
  assert.ok(v.errors.some((e) => e.includes("isn't defined")));
});

// --- plain DESIGN.md (no cambia block) --------------------------------------
test('validate on a plain DESIGN.md reports no cambia block, no error', () => {
  const v = validate(`---\nname: Plain\ncomponents: { b: {} }\n---\n# Plain\n`);
  assert.equal(v.hasCambia, false);
  assert.equal(v.errors.length, 0);
});

// --- spliceBlock direct: unterminated front matter --------------------------
test('spliceBlock throws on unterminated front matter', () => {
  assert.throws(() => spliceBlock('---\nname: oops\nno closing fence\n', 'cambia', { version: '0.1' }), /Unterminated/);
});
