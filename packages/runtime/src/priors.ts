import type { Counts } from './kernel.js';

// Built-in born-adapted priors, keyed by archetype → trait → pseudo-counts.
// These ship with the runtime so a brand-new user starts on a sensible default
// before any community genome or personal history exists (cold start).
export const PRIORS: Record<string, Record<string, Counts>> = {
  analytics: {
    density: { compact: 3, comfortable: 1 }, // dense by default
    'default-sort': { __recency__: 2 }, // newest first
  },
  crud: {
    density: { comfortable: 3, compact: 1 },
  },
  marketing: {
    density: { comfortable: 3, compact: 1 },
  },
  settings: {
    density: { comfortable: 2, compact: 1 },
  },
};

// Used when no archetype is given, or the archetype has no prior for a trait.
export const GENERIC_PRIORS: Record<string, Counts> = {
  density: { comfortable: 1, compact: 1 },
};

export function getPrior(archetype: string | undefined, trait: string): Counts {
  const byArchetype = (archetype && PRIORS[archetype]) || {};
  return { ...(byArchetype[trait] ?? GENERIC_PRIORS[trait] ?? {}) };
}
