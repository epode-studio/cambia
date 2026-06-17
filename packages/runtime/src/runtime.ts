import { readFrontMatter } from '@cambia/core';
import { Trait } from './kernel.js';
import { getPrior } from './priors.js';
import { type CambiaStore, createMemoryStore } from './store.js';

export interface CambiaOptions {
  /** DESIGN.md text containing a `cambia:` block (the role/conserved/adaptive declaration). */
  designMd: string;
  /** Scopes persisted state so different users personalize independently. */
  userId?: string;
  /** Pluggable local store. Defaults to in-memory. Use `createLocalStorageStore()` in a browser. */
  store?: CambiaStore;
  /** Anti-thrash margin (a new winner must beat the incumbent by this factor to switch). */
  switchMargin?: number;
}

export type RoleValues = Record<string, string | undefined>;
export interface Observation {
  trait: string;
  value: string;
}
type Listener = () => void;

export class Role {
  private readonly traits = new Map<string, Trait>();
  private readonly listeners = new Set<Listener>();
  private snapshot: RoleValues;

  constructor(
    public readonly name: string,
    /** Conserved traits — the grammar. Never adaptable; not in the runtime's data model. */
    public readonly conserved: string[],
    adaptiveTraits: string[],
    archetype: string | undefined,
    private readonly store: CambiaStore,
    private readonly storeKey: (trait: string) => string,
    switchMargin: number
  ) {
    for (const trait of adaptiveTraits) {
      const prior = getPrior(archetype, trait);
      let observed = {};
      let initial: string | undefined;
      const raw = store.get(storeKey(trait));
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          observed = parsed.observed ?? {};
          initial = parsed.current;
        } catch {
          // Corrupt entry — start fresh from the born-adapted prior.
        }
      }
      this.traits.set(trait, new Trait(prior, observed, switchMargin, initial));
    }
    this.snapshot = this.computeSnapshot();
  }

  private computeSnapshot(): RoleValues {
    const out: RoleValues = {};
    for (const [name, trait] of this.traits) out[name] = trait.value();
    return out;
  }

  /** Current adapted values, keyed by trait. Stable identity until something changes. */
  values(): RoleValues {
    return this.snapshot;
  }

  value(trait: string): string | undefined {
    return this.traits.get(trait)?.value();
  }

  /** Whether a trait is adaptive (declared adaptive AND therefore in the model). */
  isAdaptive(trait: string): boolean {
    return this.traits.has(trait);
  }

  /**
   * Feed a usage signal. Conserved/unknown traits are silently ignored — they are not
   * in the model, so they cannot be adapted even in principle (structural safety).
   */
  observe(obs: Observation): void {
    const trait = this.traits.get(obs.trait);
    if (!trait) return;
    const changed = trait.observe(obs.value);
    this.store.set(this.storeKey(obs.trait), JSON.stringify(trait.serialize()));
    if (changed) {
      this.snapshot = this.computeSnapshot();
      for (const l of this.listeners) l();
    }
  }

  /** Subscribe to value changes (used by framework bindings). Returns an unsubscribe fn. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** The adaptive trait names this role tracks. */
  traitNames(): string[] {
    return [...this.traits.keys()];
  }

  /**
   * Forget this role's learned state — erase it from the store and snap every trait back
   * to its born-adapted prior. Notifies subscribers so the live UI reverts.
   */
  reset(): void {
    for (const [name, trait] of this.traits) {
      const key = this.storeKey(name);
      if (this.store.remove) this.store.remove(key);
      else this.store.set(key, '');
      trait.reset();
    }
    this.snapshot = this.computeSnapshot();
    for (const l of this.listeners) l();
  }
}

export class Cambia {
  private readonly roles = new Map<string, Role>();
  private readonly userId: string;
  private readonly store: CambiaStore;

  constructor(opts: CambiaOptions) {
    const { frontMatter } = readFrontMatter(opts.designMd);
    const cambia = frontMatter?.cambia;
    if (!cambia?.roles || typeof cambia.roles !== 'object') {
      throw new Error('No `cambia:` block with roles found in the provided DESIGN.md.');
    }
    const archetype: string | undefined = cambia.context?.archetype;
    const store = opts.store ?? createMemoryStore();
    const userId = opts.userId ?? 'default';
    const margin = opts.switchMargin ?? 1.5;
    this.store = store;
    this.userId = userId;

    for (const [roleName, role] of Object.entries<any>(cambia.roles)) {
      const conserved = Array.isArray(role?.conserved) ? role.conserved : [];
      const adaptive = Array.isArray(role?.adaptive) ? role.adaptive : [];
      const key = (trait: string) => `${userId}:${roleName}:${trait}`;
      this.roles.set(roleName, new Role(roleName, conserved, adaptive, archetype, store, key, margin));
    }
  }

  role(name: string): Role {
    const role = this.roles.get(name);
    if (!role) throw new Error(`Role "${name}" is not defined in the cambia: block.`);
    return role;
  }

  roleNames(): string[] {
    return [...this.roles.keys()];
  }

  /**
   * Erase a user's personalization — their stored estimates are deleted and every adaptive
   * trait snaps back to the born-adapted default. The GDPR "right to erasure", in one call.
   *
   * Omit `userId` (or pass this engine's own user) to also reset the live, in-memory state and
   * notify subscribers so the UI reverts immediately. Passing a different user clears that
   * user's persisted state in the store (best-effort) without touching this engine's live state.
   */
  forget(userId?: string): void {
    const target = userId ?? this.userId;
    if (target === this.userId) {
      for (const role of this.roles.values()) role.reset();
      return;
    }
    for (const [roleName, role] of this.roles) {
      for (const trait of role.traitNames()) {
        const key = `${target}:${roleName}:${trait}`;
        if (this.store.remove) this.store.remove(key);
        else this.store.set(key, '');
      }
    }
  }
}

/** Create a live Cambia engine from a DESIGN.md's `cambia:` block. */
export function createCambia(opts: CambiaOptions): Cambia {
  return new Cambia(opts);
}
