import { AppError } from "../../pkg/errors/error";
import { Err, Ok, type Result, wrap } from "../../pkg/errors/result";
import { AppLogger } from "../../pkg/logging";

/**
 * Interface for storage operations
 */
export interface IStorage {
  /**
   * Upload data to storage
   */
  put(
    key: string,
    body: ReadableStream | ArrayBuffer | string,
  ): Promise<Result<void, AppError>>;

  /**
   * Get data from storage
   */
  get(key: string): Promise<Result<R2ObjectBody, AppError>>;

  /**
   * Delete data from storage
   */
  delete(key: string): Promise<Result<void, AppError>>;

  /**
   * List objects from storage
   */
  list(prefix?: string): Promise<Result<R2Objects, AppError>>;
}

/**
 * Implementation of storage using Cloudflare R2
 */
export class R2Storage implements IStorage {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  /**
   * Upload data to R2 bucket
   */
  async put(
    key: string,
    body: ReadableStream | ArrayBuffer | string,
  ): Promise<Result<void, AppError>> {
    const result = await wrap(this.bucket.put(key, body), (error) => {
      AppLogger.error(
        `Failed to upload object with key ${key}: ${error.message}`,
      );
      return new AppError({
        message: `Failed to upload object with key ${key}`,
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
      });
    });

    if (result.err) {
      return Err(result.err);
    }

    AppLogger.info(`Successfully uploaded object with key: ${key}`);
    return Ok();
  }

  /**
   * Get data from R2 bucket
   */
  async get(key: string): Promise<Result<R2ObjectBody, AppError>> {
    const result = await wrap(
      this.bucket.get(key),
      (error) =>
        new AppError({
          message: `Failed to get object with key ${key}`,
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
        }),
    );

    if (result.err) {
      AppLogger.error(result.err.message);
      return Err(result.err);
    }

    if (!result.val) {
      AppLogger.info(`Object with key ${key} not found`);
      return Err(
        new AppError({
          message: `Object with key ${key} not found`,
          code: "NOT_FOUND",
        }),
      );
    }

    AppLogger.info(`Successfully retrieved object with key: ${key}`);
    return Ok(result.val);
  }

  /**
   * Delete data from R2 bucket
   */
  async delete(key: string): Promise<Result<void, AppError>> {
    const result = await wrap(this.bucket.delete(key), (error) => {
      AppLogger.error(
        `Failed to delete object with key ${key}: ${error.message}`,
      );
      return new AppError({
        message: `Failed to delete object with key ${key}`,
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
      });
    });

    if (result.err) {
      return Err(result.err);
    }

    AppLogger.info(`Successfully deleted object with key: ${key}`);
    return Ok();
  }

  /**
   * List objects in R2 bucket
   */
  async list(prefix?: string): Promise<Result<R2Objects, AppError>> {
    const options: R2ListOptions = prefix ? { prefix } : {};

    const result = await wrap(
      this.bucket.list(options),
      (error) =>
        new AppError({
          message: `Failed to list objects${prefix ? ` with prefix ${prefix}` : ""}`,
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
        }),
    );

    if (result.err) {
      AppLogger.error(
        `Failed to list objects${prefix ? ` with prefix ${prefix}` : ""}: ${result.err.message}`,
      );
      return Err(result.err);
    }

    AppLogger.info(
      `Listed ${result.val.objects.length} objects${prefix ? ` with prefix ${prefix}` : ""}`,
    );
    return Ok(result.val);
  }
}
