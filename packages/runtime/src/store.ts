// Pluggable local store for per-user trait estimates. Synchronous by design so the
// runtime stays framework-zero and easy to test. Nothing here ever leaves the device.

export interface CambiaStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  /** Optional: delete a key. If absent, the runtime overwrites with an empty value instead. */
  remove?(key: string): void;
}

export function createMemoryStore(): CambiaStore {
  const map = new Map<string, string>();
  return {
    get: (k) => (map.has(k) ? (map.get(k) as string) : null),
    set: (k, v) => {
      map.set(k, v);
    },
    remove: (k) => {
      map.delete(k);
    },
  };
}

/**
 * Browser-backed store using `localStorage`. Falls back to an in-memory store when
 * `localStorage` is unavailable (SSR, Node, private mode). Keys are namespaced.
 */
interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createLocalStorageStore(namespace = 'cambia'): CambiaStore {
  try {
    const ls = (globalThis as { localStorage?: WebStorageLike }).localStorage;
    if (!ls) return createMemoryStore();
    return {
      get: (k) => ls.getItem(`${namespace}:${k}`),
      set: (k, v) => ls.setItem(`${namespace}:${k}`, v),
      remove: (k) => ls.removeItem(`${namespace}:${k}`),
    };
  } catch {
    return createMemoryStore();
  }
}
