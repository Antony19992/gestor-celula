interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const PREFIX = "gc:";

export const localCache = {
  get<T>(key: string): CacheEntry<T> | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // localStorage indisponível ou cheio
    }
  },

  delete(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignora
    }
  },

  isStale(entry: CacheEntry<unknown>, ttlMs: number): boolean {
    return Date.now() - entry.timestamp > ttlMs;
  },
};
