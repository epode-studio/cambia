export { type ValidationResult, validate } from './check.js';
export {
  detectEol,
  type Eol,
  type ParsedFrontMatter,
  readFrontMatter,
  spliceBlock,
  writeFrontMatter,
} from './frontmatter.js';

export { type RoleEntry, type ScaffoldResult, scaffold } from './init.js';
export {
  CANONICAL_ROLES,
  type CanonicalRole,
  defaultAdaptive,
  defaultConserved,
  guessRole,
  PLACEHOLDER_ARCHETYPE,
  PLACEHOLDER_COMPONENT,
} from './roles.js';
export {
  type FontSizeValue,
  isEmptyTheme,
  renderTailwindTheme,
  type TailwindFormat,
  type TailwindTheme,
  type TailwindThemeExtend,
  tokensToTailwind,
} from './tailwind.js';
