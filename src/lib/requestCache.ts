type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  cachedAt: number;
};

type CachedResourceOptions<T> = {
  key: string;
  ttlMs: number;
  fetcher: () => Promise<T>;
  staleWhileRevalidate?: boolean;
  persistToSession?: boolean;
};

const SESSION_CACHE_PREFIX = 'hp_request_cache:';
const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const getSessionCacheKey = (key: string) => `${SESSION_CACHE_PREFIX}${key}`;

const isCacheEntry = (value: unknown): value is CacheEntry<unknown> => {
  if (!value || typeof value !== 'object') return false;
  const target = value as Partial<CacheEntry<unknown>>;
  return (
    'data' in target &&
    typeof target.expiresAt === 'number' &&
    typeof target.cachedAt === 'number'
  );
};

const readSessionEntry = <T>(key: string): CacheEntry<T> | null => {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.sessionStorage.getItem(getSessionCacheKey(key));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as unknown;
    if (!isCacheEntry(parsed)) return null;
    return parsed as CacheEntry<T>;
  } catch {
    return null;
  }
};

const writeSessionEntry = <T>(key: string, entry: CacheEntry<T>) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(getSessionCacheKey(key), JSON.stringify(entry));
  } catch {
    // Ignore storage quota or availability failures.
  }
};

const deleteSessionEntry = (key: string) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(getSessionCacheKey(key));
  } catch {
    // Ignore storage failures.
  }
};

const getCachedEntry = <T>(key: string, persistToSession: boolean): CacheEntry<T> | null => {
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry) {
    return memoryEntry as CacheEntry<T>;
  }

  if (!persistToSession) return null;

  const sessionEntry = readSessionEntry<T>(key);
  if (sessionEntry) {
    memoryCache.set(key, sessionEntry);
  }
  return sessionEntry;
};

const setCachedEntry = <T>(key: string, entry: CacheEntry<T>, persistToSession: boolean) => {
  memoryCache.set(key, entry);
  if (persistToSession) {
    writeSessionEntry(key, entry);
  }
};

const runFetcher = async <T>({
  key,
  ttlMs,
  fetcher,
  persistToSession,
}: Pick<CachedResourceOptions<T>, 'key' | 'ttlMs' | 'fetcher' | 'persistToSession'>): Promise<T> => {
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const nextRequest = fetcher()
    .then((data) => {
      const now = Date.now();
      setCachedEntry(
        key,
        {
          data,
          cachedAt: now,
          expiresAt: now + ttlMs,
        },
        persistToSession,
      );
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, nextRequest);
  return nextRequest;
};

export const getCachedResource = async <T>({
  key,
  ttlMs,
  fetcher,
  staleWhileRevalidate = true,
  persistToSession = true,
}: CachedResourceOptions<T>): Promise<T> => {
  const now = Date.now();
  const cachedEntry = getCachedEntry<T>(key, persistToSession);

  if (cachedEntry) {
    if (cachedEntry.expiresAt > now) {
      return cachedEntry.data;
    }

    if (staleWhileRevalidate) {
      void runFetcher({ key, ttlMs, fetcher, persistToSession });
      return cachedEntry.data;
    }
  }

  return runFetcher({ key, ttlMs, fetcher, persistToSession });
};

export const primeCachedResource = <T>(key: string, data: T, ttlMs: number, persistToSession = true) => {
  const now = Date.now();
  setCachedEntry(
    key,
    {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
    },
    persistToSession,
  );
};

export const invalidateCachedResource = (key: string) => {
  memoryCache.delete(key);
  inFlightRequests.delete(key);
  deleteSessionEntry(key);
};

export const invalidateCachedResourcePrefix = (prefix: string) => {
  Array.from(memoryCache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
      inFlightRequests.delete(key);
      deleteSessionEntry(key);
    }
  });

  if (typeof window === 'undefined') return;

  try {
    Object.keys(window.sessionStorage).forEach((storageKey) => {
      if (storageKey.startsWith(getSessionCacheKey(prefix))) {
        window.sessionStorage.removeItem(storageKey);
      }
    });
  } catch {
    // Ignore storage failures.
  }
};

export const invalidateAllCachedResources = () => {
  Array.from(memoryCache.keys()).forEach((key) => {
    invalidateCachedResource(key);
  });
};
