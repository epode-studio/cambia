import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isEmptyTheme,
  readFrontMatter,
  renderTailwindTheme,
  type ScaffoldResult,
  scaffold,
  type TailwindFormat,
  tokensToTailwind,
  type ValidationResult,
  validate,
} from '@cambia/core';

const HERE = path.dirname(fileURLToPath(import.meta.url)); // packages/cli/dist
const PKG_ROOT = path.join(HERE, '..');
const ASSETS = path.join(PKG_ROOT, 'assets');

function version(): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version;
  } catch {
    return '0.0.0';
  }
}

function help(): void {
  console.log(`
cambia — a DESIGN.md extension that makes a design system role-aware and
(optionally) adaptive. Cambia is the living growth layer on top of DESIGN.md:
keep using \`@google/design.md\` for the visual layer; \`cambia\` handles the layer above.

Usage:
  npx cambia init [--file DESIGN.md] [--dry-run]   Add a cambia: extension to a DESIGN.md
  npx cambia check [DESIGN.md]                     Validate the cambia: extension
  npx cambia tailwind [--file DESIGN.md]           Generate a Tailwind theme from DESIGN.md tokens
            [--out FILE] [--check FILE] [--format esm|cjs|json]
  npx cambia skill [claude|cursor]                 Install the agent skill/rule into your project
  npx cambia help                                  Show this help
  npx cambia --version                             Print the version

Typical flow:
  npx @google/design.md lint DESIGN.md   # validate the visual layer (Google)
  npx cambia init                        # add roles + adaptive layer (Cambia)
  npx cambia check                       # validate the Cambia layer
`);
}

interface Flags {
  file?: string;
  dryRun?: boolean;
}

function parseFlags(list: string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '--file') flags.file = list[++i];
    else if (list[i] === '--dry-run') flags.dryRun = true;
  }
  return flags;
}

function runInit(flags: Flags): void {
  const file = flags.file || 'DESIGN.md';
  if (!fs.existsSync(file)) {
    console.error(`✗ ${file} not found.`);
    console.error('  Cambia extends an existing DESIGN.md. Create one first:');
    console.error('    npx @google/design.md spec        # read the format');
    console.error('    ...then write DESIGN.md (or ask your agent to).');
    process.exit(1);
  }

  const original = fs.readFileSync(file, 'utf8');
  let result: ScaffoldResult;
  try {
    result = scaffold(original);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  }

  if (result.alreadyPresent) {
    console.log(`${file} already has a \`cambia:\` block. Leaving it untouched.`);
    console.log('Run `cambia check` to validate it.');
    return;
  }

  if (flags.dryRun) {
    console.log(`— dry run: ${file} would gain a \`cambia:\` block (not written) —\n`);
    console.log(result.text);
    return;
  }

  fs.writeFileSync(file, result.text);
  console.log(`✓ Added a \`cambia:\` block to ${file}`);
  if (result.mapped.length) {
    console.log(`  Inferred roles: ${result.mapped.map((m) => `${m.component} → ${m.role}`).join(', ')}`);
  }
  if (result.unmapped.length) {
    console.log(`  Couldn't guess a role for: ${result.unmapped.join(', ')} (add by hand).`);
  }
  if (result.usedPlaceholder) {
    console.log('  No roles inferred — wrote a TODO placeholder. Map it to a real component.');
  }
  console.log('\n  Review the roles, set the archetype, and decide what’s adaptive vs conserved.');
  console.log(`  Then: \`cambia check ${file}\``);
}

function runCheck(file: string): void {
  if (!fs.existsSync(file)) {
    console.error(`✗ ${file} not found.`);
    process.exit(1);
  }

  const text = fs.readFileSync(file, 'utf8');
  let result: ValidationResult;
  try {
    result = validate(text);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    console.error('  Tip: run `npx @google/design.md lint` for the base file first.');
    process.exit(1);
  }

  if (!result.hasFrontMatter) {
    console.error(`✗ ${file} has no YAML front matter — is this a DESIGN.md?`);
    process.exit(1);
  }
  if (!result.hasCambia) {
    console.log('No `cambia:` block found — this is a plain DESIGN.md (valid, just not role-aware).');
    console.log('Run `cambia init` to add a Cambia extension.');
    return;
  }

  const { errors, warnings, info, roleCount } = result;
  if (!errors.length && !warnings.length) {
    console.log(`✓ ${file} — Cambia extension valid (${roleCount} role(s)).`);
  }
  for (const e of errors) console.log(`✗ ${e}`);
  for (const w of warnings) console.log(`! ${w}`);
  for (const i of info) console.log(`· ${i}`);
  if (errors.length) {
    console.log(`\n✗ ${file} — Cambia extension has ${errors.length} error(s).`);
  } else if (warnings.length || info.length) {
    console.log(`\n✓ ${file} — Cambia extension valid (${roleCount} role(s), with notes).`);
  }
  console.log('\nReminder: validate the visual layer separately with `npx @google/design.md lint`.');

  if (errors.length) process.exit(1);
}

interface TailwindFlags {
  file: string;
  out?: string;
  check?: string;
  format: TailwindFormat;
}

function parseTailwindFlags(list: string[]): TailwindFlags {
  const flags: TailwindFlags = { file: 'DESIGN.md', format: 'esm' };
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '--file') flags.file = list[++i];
    else if (list[i] === '--out') flags.out = list[++i];
    else if (list[i] === '--check') flags.check = list[++i];
    else if (list[i] === '--format') flags.format = list[++i] as TailwindFormat;
  }
  return flags;
}

function runTailwind(args: string[]): void {
  const flags = parseTailwindFlags(args);
  if (!['esm', 'cjs', 'json'].includes(flags.format)) {
    console.error(`✗ Unknown --format "${flags.format}". Use: esm | cjs | json`);
    process.exit(1);
  }
  if (!fs.existsSync(flags.file)) {
    console.error(`✗ ${flags.file} not found.`);
    process.exit(1);
  }

  let rendered: string;
  try {
    const { frontMatter } = readFrontMatter(fs.readFileSync(flags.file, 'utf8'));
    if (!frontMatter) {
      console.error(`✗ ${flags.file} has no YAML front matter — is this a DESIGN.md?`);
      process.exit(1);
    }
    const theme = tokensToTailwind(frontMatter);
    if (isEmptyTheme(theme)) {
      console.error(`✗ No design tokens (colors, spacing, rounded, typography) found in ${flags.file}.`);
      process.exit(1);
    }
    rendered = renderTailwindTheme(theme, flags.format);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  }

  // Drift check: re-generate from DESIGN.md and compare to a committed file.
  if (flags.check) {
    const existing = fs.existsSync(flags.check) ? fs.readFileSync(flags.check, 'utf8') : null;
    if (existing === rendered) {
      console.log(`✓ ${flags.check} is in sync with ${flags.file}.`);
      return;
    }
    console.error(`✗ ${flags.check} has drifted from ${flags.file}'s tokens.`);
    console.error(
      `  Regenerate it: cambia tailwind --file ${flags.file} --out ${flags.check} --format ${flags.format}`
    );
    process.exit(1);
  }

  if (flags.out) {
    fs.writeFileSync(flags.out, rendered);
    console.log(`✓ Wrote Tailwind theme from ${flags.file} → ${flags.out}`);
    console.log('  Use it in tailwind.config: `theme: cambiaTheme` (or spread `...cambiaTheme.extend`).');
    return;
  }

  process.stdout.write(rendered);
}

const SKILL_TARGETS: Record<string, { src: string; dest: string }> = {
  claude: { src: path.join(ASSETS, 'skills/claude/SKILL.md'), dest: '.claude/skills/cambia/SKILL.md' },
  cursor: { src: path.join(ASSETS, 'skills/cursor/cambia.mdc'), dest: '.cursor/rules/cambia.mdc' },
};

function installSkill(which: string): void {
  const target = SKILL_TARGETS[which];
  if (!target) {
    console.error(`✗ Unknown skill target "${which}". Use: claude | cursor`);
    process.exit(1);
  }
  const dest = path.resolve(process.cwd(), target.dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(target.src, dest);
  console.log(`✓ Installed ${which} skill → ${target.dest}`);
}

function runSkill(which?: string): void {
  if (!which) {
    for (const key of Object.keys(SKILL_TARGETS)) installSkill(key);
    console.log('\n  Your agent will now read DESIGN.md + its cambia: layer before building UI.');
    return;
  }
  installSkill(which);
}

const [, , cmd, ...args] = process.argv;

try {
  switch (cmd) {
    case 'init':
      runInit(parseFlags(args));
      break;
    case 'check':
      runCheck(args[0] && !args[0].startsWith('-') ? args[0] : 'DESIGN.md');
      break;
    case 'tailwind':
      runTailwind(args);
      break;
    case 'skill':
      runSkill(args[0]);
      break;
    case '--version':
    case '-v':
      console.log(version());
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      help();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      help();
      process.exit(1);
  }
} catch (err) {
  console.error('Error:', (err as Error).message);
  process.exit(1);
}
