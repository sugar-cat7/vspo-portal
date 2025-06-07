import { DurableObject } from "cloudflare:workers";
import { AppError, Err, Ok, type Result, wrap } from "@vspo-lab/error";

export class DiscordRateLimiter extends DurableObject {
  private static readonly MAX_REQUESTS_PER_SECOND = 50;
  private static readonly RATE_LIMIT_WINDOW_SECONDS = 1;
  private static readonly CLEANUP_INTERVAL_SECONDS = 1; // Cleanup every 1 second

  // In-memory state initialized once
  private counterValue = 0;
  private isInitialized = false;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);

    // Use blockConcurrencyWhile to ensure proper initialization
    this.ctx.blockConcurrencyWhile(async () => {
      await this.initialize();
    });
  }

  private async initialize(): Promise<void> {
    // Initialize counter value from storage
    const stored = await this.ctx.storage.get("value");
    this.counterValue = (stored as number) || 0;

    // Initialize alarm if needed
    await this.initializeAlarmIfNeeded();

    this.isInitialized = true;
  }

  async getCounterValue(): Promise<Result<number, AppError>> {
    // Return cached value instead of storage access
    return Ok(this.counterValue);
  }

  // Alarm handler: Execute periodic cleanup
  async alarm(alarmInfo?: {
    retryCount: number;
    isRetry: boolean;
  }): Promise<void> {
    if (alarmInfo?.isRetry) {
      console.log(`Alarm retry attempt ${alarmInfo.retryCount}`);
    }

    const cleanupResult = await wrap(
      this.cleanupOldRateLimitData(),
      (err: Error) =>
        new AppError({
          message: "Failed to cleanup old rate limit data",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );

    if (cleanupResult.err) {
      console.error("Failed to run cleanup alarm:", cleanupResult.err);

      if (alarmInfo?.retryCount && alarmInfo.retryCount >= 6) {
        console.error("Maximum retry attempts reached, stopping alarm");
        const deleteResult = await wrap(
          this.ctx.storage.deleteAlarm(),
          () =>
            new AppError({
              message: "Failed to delete alarm",
              code: "INTERNAL_SERVER_ERROR",
            }),
        );
        if (deleteResult.err) {
          console.error("Failed to delete alarm:", deleteResult.err);
        }
        return;
      }

      throw cleanupResult.err;
    }

    const setAlarmResult = await wrap(
      this.ctx.storage.setAlarm(
        Date.now() + DiscordRateLimiter.CLEANUP_INTERVAL_SECONDS * 1000,
      ),
      (err: Error) =>
        new AppError({
          message: "Failed to set alarm",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );

    if (setAlarmResult.err) {
      console.error("Failed to set next alarm:", setAlarmResult.err);
      throw setAlarmResult.err;
    }

    console.log("Cleanup alarm completed successfully");
  }

  // Clean up old rate limit data - simplified with built-in cache
  private async cleanupOldRateLimitData(): Promise<void> {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);

    // Get all keys from storage - built-in cache makes this efficient
    const allKeys = await this.ctx.storage.list();
    const keysToDelete: string[] = [];

    for (const [key] of allKeys) {
      // Process only keys starting with rate_limit_
      if (typeof key === "string" && key.startsWith("rate_limit_")) {
        const timestampStr = key.replace("rate_limit_", "");
        const timestamp = Number.parseInt(timestampStr, 10);

        // Mark data older than current second for deletion
        if (!Number.isNaN(timestamp) && timestamp < currentSecond - 1) {
          // Keep last 2 seconds
          keysToDelete.push(key);
        }
      }
    }

    // Batch delete old keys
    if (keysToDelete.length > 0) {
      await this.ctx.storage.delete(keysToDelete);
      console.log(`Cleaned up ${keysToDelete.length} old rate limit entries`);
    }
  }

  // Initialize alarm if needed - relies on built-in cache
  private async initializeAlarmIfNeeded(): Promise<void> {
    // Built-in cache makes this check efficient
    const currentAlarm = await this.ctx.storage.getAlarm();

    if (currentAlarm === null) {
      // Set alarm if not already set
      const nextCleanupTime =
        Date.now() + DiscordRateLimiter.CLEANUP_INTERVAL_SECONDS * 1000;
      const setAlarmResult = await wrap(
        this.ctx.storage.setAlarm(nextCleanupTime),
        (err: Error) =>
          new AppError({
            message: "Failed to set initial alarm",
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
          }),
      );
      if (setAlarmResult.err) {
        console.error("Failed to set initial alarm:", setAlarmResult.err);
        return;
      }
      console.log("Initialized cleanup alarm");
    }
  }

  async checkRateLimit(): Promise<
    Result<{ currentCount: number; resetTime: number }, AppError>
  > {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    const rateLimitKey = `rate_limit_${currentSecond}`;

    // Built-in cache makes this get() call very efficient for recent data
    const rateLimitResult = await wrap(
      this.ctx.storage.get(rateLimitKey).then(async (value) => {
        const currentCount = (value as number) || 0;

        if (currentCount >= DiscordRateLimiter.MAX_REQUESTS_PER_SECOND) {
          throw new AppError({
            message: `Rate limit exceeded. Current count: ${currentCount}/${DiscordRateLimiter.MAX_REQUESTS_PER_SECOND}`,
            code: "RATE_LIMITED",
            context: {
              currentCount,
              maxRequests: DiscordRateLimiter.MAX_REQUESTS_PER_SECOND,
              resetTime: (currentSecond + 1) * 1000,
            },
          });
        }

        const newCount = currentCount + 1;

        // Built-in cache makes subsequent reads of this key instant
        await this.ctx.storage.put(rateLimitKey, newCount);

        return {
          currentCount: newCount,
          resetTime: (currentSecond + 1) * 1000,
        };
      }),
      (err: Error) => {
        if (err instanceof AppError) {
          return err;
        }
        return new AppError({
          message: "Failed to check rate limit",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        });
      },
    );

    return rateLimitResult.err
      ? Err(rateLimitResult.err)
      : Ok(rateLimitResult.val);
  }

  // Manually reset rate limit (for testing)
  async resetRateLimit(): Promise<Result<void, AppError>> {
    const result = await wrap(
      this.cleanupOldRateLimitData(),
      (err: Error) =>
        new AppError({
          message: "Failed to reset rate limit",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );
    return result.err ? Err(result.err) : Ok(undefined);
  }

  // Combined operation: rate limit check + counter increment
  async incrementWithRateLimit(amount = 1): Promise<
    Result<
      {
        newValue: number;
        rateLimitInfo: { currentCount: number; resetTime: number };
      },
      AppError
    >
  > {
    // Check rate limit first
    const rateLimitResult = await this.checkRateLimit();
    if (rateLimitResult.err) {
      return Err(rateLimitResult.err);
    }

    // Update in-memory value and persist to storage
    this.counterValue += amount;

    const persistResult = await wrap(
      this.ctx.storage.put("value", this.counterValue),
      (err: Error) =>
        new AppError({
          message: "Failed to persist counter increment",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
          context: { amount, newValue: this.counterValue },
        }),
    );

    if (persistResult.err) {
      // Rollback in-memory value on storage failure
      this.counterValue -= amount;
      return Err(persistResult.err);
    }

    return Ok({
      newValue: this.counterValue,
      rateLimitInfo: rateLimitResult.val,
    });
  }

  // Combined operation: rate limit check + counter decrement
  async decrementWithRateLimit(amount = 1): Promise<
    Result<
      {
        newValue: number;
        rateLimitInfo: { currentCount: number; resetTime: number };
      },
      AppError
    >
  > {
    // Check rate limit first
    const rateLimitResult = await this.checkRateLimit();
    if (rateLimitResult.err) {
      return Err(rateLimitResult.err);
    }

    // Update in-memory value and persist to storage
    this.counterValue -= amount;

    const persistResult = await wrap(
      this.ctx.storage.put("value", this.counterValue),
      (err: Error) =>
        new AppError({
          message: "Failed to persist counter decrement",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
          context: { amount, newValue: this.counterValue },
        }),
    );

    if (persistResult.err) {
      // Rollback in-memory value on storage failure
      this.counterValue += amount;
      return Err(persistResult.err);
    }

    return Ok({
      newValue: this.counterValue,
      rateLimitInfo: rateLimitResult.val,
    });
  }

  // Legacy methods for backward compatibility
  async increment(amount = 1): Promise<Result<number, AppError>> {
    const result = await this.incrementWithRateLimit(amount);
    return result.err ? Err(result.err) : Ok(result.val.newValue);
  }

  async decrement(amount = 1): Promise<Result<number, AppError>> {
    const result = await this.decrementWithRateLimit(amount);
    return result.err ? Err(result.err) : Ok(result.val.newValue);
  }

  // Batch operations for multiple counter updates
  async batchUpdate(
    operations: Array<{ type: "increment" | "decrement"; amount: number }>,
  ): Promise<
    Result<
      {
        finalValue: number;
        rateLimitInfo: { currentCount: number; resetTime: number };
      },
      AppError
    >
  > {
    // Check rate limit once for the batch
    const rateLimitResult = await this.checkRateLimit();
    if (rateLimitResult.err) {
      return Err(rateLimitResult.err);
    }

    // Calculate total change
    const totalChange = operations.reduce((sum, op) => {
      return sum + (op.type === "increment" ? op.amount : -op.amount);
    }, 0);

    // Update in-memory value
    const originalValue = this.counterValue;
    this.counterValue += totalChange;

    // Persist to storage
    const persistResult = await wrap(
      this.ctx.storage.put("value", this.counterValue),
      (err: Error) =>
        new AppError({
          message: "Failed to perform batch update",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
          context: { operations, totalChange, finalValue: this.counterValue },
        }),
    );

    if (persistResult.err) {
      // Rollback in-memory value on storage failure
      this.counterValue = originalValue;
      return Err(persistResult.err);
    }

    return Ok({
      finalValue: this.counterValue,
      rateLimitInfo: rateLimitResult.val,
    });
  }

  // Manually stop alarm (for management)
  async stopAlarm(): Promise<Result<void, AppError>> {
    const result = await wrap(
      this.ctx.storage.deleteAlarm().then(() => {
        console.log("Alarm stopped manually");
      }),
      (err: Error) =>
        new AppError({
          message: "Failed to stop alarm",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );
    return result.err ? Err(result.err) : Ok(undefined);
  }

  // Manually restart alarm (for management)
  async startAlarm(): Promise<Result<void, AppError>> {
    await this.initializeAlarmIfNeeded();
    return Ok(undefined);
  }

  // Get rate limit status (for debugging) - leverages built-in cache
  async getRateLimitStatus(): Promise<
    Result<
      {
        currentCount: number;
        maxRequests: number;
        remaining: number;
        resetTime: number;
        windowSeconds: number;
      },
      AppError
    >
  > {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    const rateLimitKey = `rate_limit_${currentSecond}`;

    return wrap(
      this.ctx.storage.get(rateLimitKey).then((currentCount) => {
        const count = (currentCount as number) || 0;

        return {
          currentCount: count,
          maxRequests: DiscordRateLimiter.MAX_REQUESTS_PER_SECOND,
          remaining: DiscordRateLimiter.MAX_REQUESTS_PER_SECOND - count,
          resetTime: (currentSecond + 1) * 1000,
          windowSeconds: DiscordRateLimiter.RATE_LIMIT_WINDOW_SECONDS,
        };
      }),
      (err: Error) =>
        new AppError({
          message: "Failed to get rate limit status",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );
  }

  // Get alarm status (for debugging)
  async getAlarmStatus(): Promise<
    Result<
      {
        isSet: boolean;
        nextExecution?: number;
        timeUntilNext?: number;
        isInitialized: boolean;
      },
      AppError
    >
  > {
    return wrap(
      this.ctx.storage.getAlarm().then((alarmTime) => {
        const now = Date.now();
        return {
          isSet: alarmTime !== null,
          nextExecution: alarmTime || undefined,
          timeUntilNext: alarmTime ? Math.max(0, alarmTime - now) : undefined,
          isInitialized: this.isInitialized,
        };
      }),
      (err: Error) =>
        new AppError({
          message: "Failed to get alarm status",
          code: "INTERNAL_SERVER_ERROR",
          cause: err,
        }),
    );
  }

  // Get in-memory state status (for debugging)
  async getInMemoryStatus(): Promise<{
    counterValue: number;
    isInitialized: boolean;
  }> {
    return {
      counterValue: this.counterValue,
      isInitialized: this.isInitialized,
    };
  }
}
