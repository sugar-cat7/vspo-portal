interface CacheMetadata {
  expiresAt: number;
}

interface CacheResult {
  cache: string | null;
  isExpired: boolean;
}

export const getCache = async (
  kv: KVNamespace,
  key: string,
): Promise<CacheResult> => {
  const k = await kv?.getWithMetadata<CacheMetadata>(key, "text");
  if (!k?.value || !k?.metadata) {
    return {
      cache: null,
      isExpired: true,
    };
  }
  return {
    cache: k?.value,
    isExpired: k?.metadata.expiresAt < Date.now(),
  };
};

export const createCache = async (
  kv: KVNamespace,
  key: string,
  data: string,
  ttl: number,
): Promise<void> => {
  const expiresAt = Date.now() + ttl;
  await kv?.put(key, data, {
    metadata: {
      expiresAt,
    },
  });
};
