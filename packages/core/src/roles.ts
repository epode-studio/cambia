// Canonical semantic roles. Prefer these for portability across design systems.
export const CANONICAL_ROLES = [
  'primary-action',
  'secondary-action',
  'tabular-list',
  'list',
  'form-field',
  'container',
  'status',
  'nav',
  'feedback',
] as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[number];

// Placeholder a fresh scaffold uses when it can't infer any role from component names.
// `validate` treats this as an unfilled-scaffold warning, not a hard error.
export const PLACEHOLDER_COMPONENT = 'TODO';
export const PLACEHOLDER_ARCHETYPE = 'TODO';

// Best-effort guess of a semantic role from a DESIGN.md component name.
export function guessRole(name: string): string | null {
  const n = name.toLowerCase();
  if (/(^|-)button|btn|cta|action/.test(n)) return 'primary-action';
  if (/table|grid|list|rows?/.test(n)) return 'tabular-list';
  if (/field|input|textbox|select|form/.test(n)) return 'form-field';
  if (/card|panel|container|section/.test(n)) return 'container';
  if (/badge|tag|status|chip|pill/.test(n)) return 'status';
  if (/nav|menu|sidebar|tab/.test(n)) return 'nav';
  return null;
}

// Sensible "conserved" defaults per role — the grammar that should never move.
export function defaultConserved(role: string): string[] {
  switch (role) {
    case 'tabular-list':
      return ['rows-are-records', 'sort-by-header'];
    case 'primary-action':
      return ['position-top-right'];
    case 'form-field':
      return ['always-labeled'];
    default:
      return [];
  }
}

// Conservative by default: nothing adapts until the author opts in.
export function defaultAdaptive(_role: string): string[] {
  return [];
}
