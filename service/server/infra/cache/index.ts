import {
  AppError,
  Err,
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";
import { withTracerResult } from "../http/trace/cloudflare";

export const cacheKey = {
  discord: (serverId: string) => `discord-serber-${serverId}`,
  creator: (memberType: string) => `creator-${memberType}`,
} as const;

/**
 * Interface for the cache client
 */
export interface ICacheClient {
  /**
   * Set a value in the cache
   * @param key The key to set
   * @param value The value to set
   * @param ttlSeconds Time to live in seconds (optional)
   */
  set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<Result<T, AppError>>;

  /**
   * Get a value from the cache
   * @param key The key to get
   */
  get<T>(key: string): Promise<Result<T | null, AppError>>;

  /**
   * Delete a value from the cache
   * @param key The key to delete
   */
  delete(key: string): Promise<Result<boolean, AppError>>;

  /**
   * Check if a key exists in the cache
   * @param key The key to check
   */
  exists(key: string): Promise<Result<boolean, AppError>>;
}

/**
 * Cloudflare KV implementation of the cache client
 */
export class CloudflareKVCacheClient implements ICacheClient {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<Result<T, AppError>> {
    return withTracerResult("cache", "set", async () => {
      AppLogger.info("Setting cache value in KV", { key });
      const options: KVNamespacePutOptions = {};

      if (ttlSeconds !== undefined) {
        options.expirationTtl = ttlSeconds;
      }

      // First put the value in the cache
      const putResult = await wrap(
        this.kv.put(key, JSON.stringify(value), options),
        (error: Error) =>
          new AppError({
            message: `Failed to set cache value in KV for key ${key}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
            cause: error,
          }),
      );

      // If there was an error, return it
      if (putResult.err) {
        AppLogger.error("Failed to set cache value in KV", {
          key,
          error: putResult.err,
        });
        return Err(putResult.err);
      }

      // Otherwise, return the original value
      return Ok(value);
    });
  }

  async get<T>(key: string): Promise<Result<T | null, AppError>> {
    return withTracerResult("cache", "get", async () => {
      AppLogger.info("Getting cache value from KV", { key });

      const result = await wrap(
        this.kv.get(key),
        (error: Error) =>
          new AppError({
            message: `Failed to get cache value from KV for key ${key}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
            cause: error,
          }),
      );

      if (result.err) {
        AppLogger.error("Failed to get cache value from KV", {
          key,
          error: result.err,
        });
        return Err(result.err);
      }

      const value = result.val;
      if (value === null) {
        AppLogger.info("KV cache miss", { key });
        return Ok(null);
      }

      AppLogger.info("KV cache hit", { key });
      return Ok(JSON.parse(value) as T);
    });
  }

  async delete(key: string): Promise<Result<boolean, AppError>> {
    return withTracerResult("cache", "delete", async () => {
      AppLogger.info("Deleting cache value from KV", { key });

      // Check if the key exists first
      const exists = await this.exists(key);
      if (exists.err) return Err(exists.err);

      const keyExists = exists.val;

      const result = await wrap(
        this.kv.delete(key),
        (error: Error) =>
          new AppError({
            message: `Failed to delete cache value from KV for key ${key}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
            cause: error,
          }),
      );

      if (result.err) {
        AppLogger.error("Failed to delete cache value from KV", {
          key,
          error: result.err,
        });
        return Err(result.err);
      }

      return Ok(keyExists);
    });
  }

  async exists(key: string): Promise<Result<boolean, AppError>> {
    return withTracerResult("cache", "exists", async () => {
      AppLogger.info("Checking if key exists in KV", { key });

      const result = await wrap(
        this.kv.get(key, { type: "text" }),
        (error: Error) =>
          new AppError({
            message: `Failed to check if key exists in KV for key ${key}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
            cause: error,
          }),
      );

      if (result.err) {
        AppLogger.error("Failed to check if key exists in KV", {
          key,
          error: result.err,
        });
        return Err(result.err);
      }

      return Ok(result.val !== null);
    });
  }
}
