import yaml from 'js-yaml';

export type Eol = '\n' | '\r\n';

export interface ParsedFrontMatter {
  /** Parsed YAML front-matter object, or null if the file has no front matter. */
  frontMatter: Record<string, any> | null;
  /** Raw YAML text between the `---` fences (line endings normalized to `\n`). */
  raw: string;
  /** Markdown body after the closing fence. */
  body: string;
  /** The dominant line ending detected in the source. */
  eol: Eol;
}

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function detectEol(text: string): Eol {
  return /\r\n/.test(text) ? '\r\n' : '\n';
}

// Split a DESIGN.md into { frontMatter, raw, body, eol }.
export function readFrontMatter(text: string): ParsedFrontMatter {
  const eol = detectEol(text);
  const m = text.match(FRONT_MATTER_RE);
  if (!m) return { frontMatter: null, raw: '', body: text, eol };
  return {
    frontMatter: (yaml.load(m[1]) as Record<string, any>) || {},
    raw: m[1],
    body: m[2],
    eol,
  };
}

// Reassemble a file from a (possibly modified) front-matter object + body.
// This is a FULL rewrite — it does not preserve comments or original formatting.
// Prefer `spliceBlock` when adding a key to a hand-authored file.
export function writeFrontMatter(obj: Record<string, any>, body: string, eol: Eol = '\n'): string {
  const dumped = yaml.dump(obj, { lineWidth: 100, noRefs: true }).trimEnd();
  const out = `---\n${dumped}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
  return eol === '\r\n' ? out.replace(/\n/g, '\r\n') : out;
}

/**
 * Non-destructively add a top-level `key:` block to an existing DESIGN.md's front matter.
 *
 * Serializes ONLY `value` and splices it in just before the closing `---` fence, leaving
 * every other line — comments, key order, quoting, flow vs block style — byte-for-byte
 * identical. The file's original line endings are preserved.
 */
export function spliceBlock(originalText: string, key: string, value: unknown): string {
  const eol = detectEol(originalText);
  const lines = originalText.split(/\r?\n/);

  if (lines[0] !== '---') {
    throw new Error("No YAML front matter to splice into (file must start with '---').");
  }

  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      close = i;
      break;
    }
  }
  if (close === -1) {
    throw new Error('Unterminated YAML front matter (missing closing `---`).');
  }

  const blockLines = yaml
    .dump({ [key]: value }, { lineWidth: 100, noRefs: true })
    .trimEnd()
    .split('\n');

  const newLines = [...lines.slice(0, close), ...blockLines, ...lines.slice(close)];
  return newLines.join(eol);
}
