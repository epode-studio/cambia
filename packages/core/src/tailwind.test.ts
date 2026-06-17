import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isEmptyTheme, readFrontMatter, renderTailwindTheme, tokensToTailwind } from './index.js';

const DESIGN = `---
name: Acme
colors:
  primary: "#1A1C1E"
  accent: "#B8422E"
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 2rem
    fontWeight: 700
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
---
# Acme
`;

function theme() {
  const { frontMatter } = readFrontMatter(DESIGN);
  return tokensToTailwind(frontMatter);
}

test('maps colors, spacing, and rounded→borderRadius', () => {
  const t = theme();
  assert.deepEqual(t.extend.colors, { primary: '#1A1C1E', accent: '#B8422E' });
  assert.deepEqual(t.extend.spacing, { sm: '8px', md: '16px' });
  assert.deepEqual(t.extend.borderRadius, { sm: '4px', md: '8px' });
});

test('maps typography to fontSize (with fontWeight) and fontFamily', () => {
  const t = theme();
  assert.deepEqual(t.extend.fontSize?.h1, ['2rem', { fontWeight: '700' }]);
  assert.equal(t.extend.fontSize?.['body-md'], '1rem'); // no weight → bare string
  assert.deepEqual(t.extend.fontFamily?.h1, ['Public Sans']);
});

test('isEmptyTheme is true for a token-less DESIGN.md', () => {
  const { frontMatter } = readFrontMatter('---\nname: Bare\n---\n# x\n');
  assert.equal(isEmptyTheme(tokensToTailwind(frontMatter)), true);
});

test('render is deterministic across formats (stable for drift checks)', () => {
  const t = theme();
  assert.equal(renderTailwindTheme(t, 'esm'), renderTailwindTheme(t, 'esm'));
  assert.ok(renderTailwindTheme(t, 'esm').includes('export const cambiaTheme'));
  assert.ok(renderTailwindTheme(t, 'cjs').includes('module.exports'));
  assert.equal(renderTailwindTheme(t, 'json').startsWith('{'), true);
});
