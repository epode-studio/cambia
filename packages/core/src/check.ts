import { readFrontMatter } from './frontmatter.js';
import { CANONICAL_ROLES, PLACEHOLDER_ARCHETYPE, PLACEHOLDER_COMPONENT } from './roles.js';

export interface ValidationResult {
  /** Whether the file has YAML front matter at all. */
  hasFrontMatter: boolean;
  /** Whether a `cambia:` block is present. */
  hasCambia: boolean;
  /** Number of roles declared. */
  roleCount: number;
  /** Hard failures — a non-empty list means the extension is invalid. */
  errors: string[];
  /** Non-fatal issues worth surfacing. */
  warnings: string[];
  /** Informational notes. */
  info: string[];
}

/**
 * Validate the `cambia:` extension in a DESIGN.md. Pure: returns a result object,
 * never throws on validation problems, never touches the filesystem or process.
 *
 * Throws only if the front matter is present but not parseable YAML (propagated from js-yaml).
 */
export function validate(text: string): ValidationResult {
  const { frontMatter } = readFrontMatter(text);
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  if (!frontMatter) {
    return { hasFrontMatter: false, hasCambia: false, roleCount: 0, errors, warnings, info };
  }

  const cambia = frontMatter.cambia;
  if (!cambia) {
    return { hasFrontMatter: true, hasCambia: false, roleCount: 0, errors, warnings, info };
  }

  const componentNames = Object.keys(frontMatter.components || {});
  let roleCount = 0;

  if (!cambia.roles || typeof cambia.roles !== 'object') {
    errors.push('`cambia.roles` is missing or not a map.');
  } else {
    roleCount = Object.keys(cambia.roles).length;
    for (const [roleName, role] of Object.entries<any>(cambia.roles)) {
      if (!(CANONICAL_ROLES as readonly string[]).includes(roleName)) {
        info.push(`Role "${roleName}" is custom (not in the canonical set). Fine, but less portable.`);
      }

      // Cross-reference the component against the DESIGN.md components block.
      if (role?.component === PLACEHOLDER_COMPONENT) {
        warnings.push(
          `Role "${roleName}" is an unfilled scaffold (component: ${PLACEHOLDER_COMPONENT}). Map it to a real component.`
        );
      } else if (role?.component && !componentNames.includes(role.component)) {
        errors.push(
          `Role "${roleName}" points to component "${role.component}", which isn't defined in DESIGN.md components.`
        );
      }

      // Conserved/adaptive must be lists if present.
      for (const key of ['conserved', 'adaptive'] as const) {
        if (role && role[key] != null && !Array.isArray(role[key])) {
          errors.push(`Role "${roleName}".${key} must be a list.`);
        }
      }

      // A trait cannot be both conserved and adaptive.
      if (role && Array.isArray(role.conserved) && Array.isArray(role.adaptive)) {
        const both = role.conserved.filter((t: string) => role.adaptive.includes(t));
        if (both.length) {
          warnings.push(`Role "${roleName}": ${both.join(', ')} listed as BOTH conserved and adaptive.`);
        }
      }
    }
  }

  if (cambia.context && (!cambia.context.archetype || cambia.context.archetype === PLACEHOLDER_ARCHETYPE)) {
    warnings.push('`cambia.context.archetype` is unset — born-adapted defaults will fall back to a generic prior.');
  }

  return { hasFrontMatter: true, hasCambia: true, roleCount, errors, warnings, info };
}
