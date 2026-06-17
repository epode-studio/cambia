import { readFrontMatter, spliceBlock } from './frontmatter.js';
import { defaultAdaptive, defaultConserved, guessRole, PLACEHOLDER_ARCHETYPE, PLACEHOLDER_COMPONENT } from './roles.js';

export interface RoleEntry {
  component: string;
  conserved: string[];
  adaptive: string[];
}

export interface ScaffoldResult {
  /** The new file content. Equals the input unchanged when `alreadyPresent` is true. */
  text: string;
  /** True if the file already had a `cambia:` block (left untouched). */
  alreadyPresent: boolean;
  /** Components that were mapped to a role. */
  mapped: { component: string; role: string }[];
  /** Components no role could be guessed for (add by hand). */
  unmapped: string[];
  /** True if no role could be inferred and a TODO placeholder was written. */
  usedPlaceholder: boolean;
}

// Variant entries like `button-primary-hover` describe states, not distinct components.
const VARIANT_SUFFIX_RE = /-(hover|active|pressed|focus|disabled)$/;

/**
 * Build a `cambia:` block from a DESIGN.md and return the file with it spliced in
 * non-destructively. Pure: does not touch the filesystem.
 */
export function scaffold(originalText: string): ScaffoldResult {
  const { frontMatter } = readFrontMatter(originalText);
  if (!frontMatter) {
    throw new Error("File has no front matter — doesn't look like a DESIGN.md.");
  }
  if (frontMatter.cambia) {
    return { text: originalText, alreadyPresent: true, mapped: [], unmapped: [], usedPlaceholder: false };
  }

  const components: Record<string, unknown> = frontMatter.components || {};
  const roles: Record<string, RoleEntry> = {};
  const mapped: { component: string; role: string }[] = [];
  const unmapped: string[] = [];

  for (const name of Object.keys(components)) {
    if (VARIANT_SUFFIX_RE.test(name)) continue;
    const role = guessRole(name);
    if (role && !roles[role]) {
      roles[role] = { component: name, conserved: defaultConserved(role), adaptive: defaultAdaptive(role) };
      mapped.push({ component: name, role });
    } else if (!role) {
      unmapped.push(name);
    }
  }

  const usedPlaceholder = Object.keys(roles).length === 0;
  const block = {
    version: '0.1',
    context: { archetype: PLACEHOLDER_ARCHETYPE },
    roles: usedPlaceholder
      ? { 'primary-action': { component: PLACEHOLDER_COMPONENT, conserved: [], adaptive: [] } }
      : roles,
  };

  return {
    text: spliceBlock(originalText, 'cambia', block),
    alreadyPresent: false,
    mapped,
    unmapped,
    usedPlaceholder,
  };
}
