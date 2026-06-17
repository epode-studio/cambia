// The estimator kernel: one small Dirichlet-multinomial estimate per adaptive trait.
// Born-adapted (prior dominates a new user), personalizing (observations accumulate),
// and thrash-proof (a new winner must clearly beat the incumbent before the UI changes).

export type Counts = Record<string, number>;

export function argmax(counts: Counts): string | undefined {
  let best: string | undefined;
  let bestVal = Number.NEGATIVE_INFINITY;
  for (const k of Object.keys(counts)) {
    if (counts[k] > bestVal) {
      bestVal = counts[k];
      best = k;
    }
  }
  return best;
}

export interface TraitState {
  observed: Counts;
  current: string | undefined;
}

export class Trait {
  current: string | undefined;

  constructor(
    /** Born-adapted prior as pseudo-counts (weighted by confidence). */
    public readonly prior: Counts = {},
    /** Per-user observed counts. */
    public observed: Counts = {},
    /** A new winner must beat the incumbent by this factor before the value switches. */
    public readonly switchMargin = 1.5,
    /** Restored current value (from persisted state), if any. */
    initial?: string
  ) {
    this.current = initial ?? argmax(this.score());
  }

  /** prior + observed, per option. */
  score(): Counts {
    const s: Counts = { ...this.prior };
    for (const k of Object.keys(this.observed)) {
      s[k] = (s[k] ?? 0) + this.observed[k];
    }
    return s;
  }

  value(): string | undefined {
    return this.current;
  }

  /**
   * Record one observation. Returns true if the current value changed.
   * Switches only when the best option clearly beats the incumbent (anti-thrash),
   * so a single stray signal never flips the interface.
   */
  observe(option: string): boolean {
    this.observed[option] = (this.observed[option] ?? 0) + 1;
    const s = this.score();
    const best = argmax(s);
    if (best === undefined || best === this.current) return false;

    if (this.current === undefined) {
      this.current = best;
      return true;
    }
    const incumbent = s[this.current] ?? 0;
    if (s[best] > incumbent * this.switchMargin) {
      this.current = best;
      return true;
    }
    return false;
  }

  serialize(): TraitState {
    return { observed: this.observed, current: this.current };
  }
}
