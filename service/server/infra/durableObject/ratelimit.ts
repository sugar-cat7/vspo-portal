import { AppError, Err, type Result } from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";

// Helper function to wait until a specific time
export const waitUntil = (timestamp: number): Promise<void> => {
  const now = Date.now();
  const waitTime = Math.max(0, timestamp - now);
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

// Helper function to retry operations with rate limit handling
export const withRateLimitRetry = async <T>(
  operation: () => Promise<Result<T, AppError>>,
  operationName: string,
  maxRetries = 3,
): Promise<Result<T, AppError>> => {
  let lastError: AppError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await operation();

    if (result.err) {
      lastError = result.err;

      // If this is a rate limit error and we have retries left
      if (result.err.code === "RATE_LIMITED" && attempt < maxRetries) {
        // Extract reset time from error context
        let resetTime: number | undefined;
        if (
          result.err.context &&
          typeof result.err.context === "object" &&
          "resetTime" in result.err.context
        ) {
          resetTime = result.err.context.resetTime as number;
        }

        if (resetTime) {
          AppLogger.info("Rate limited, waiting until reset time", {
            operation: operationName,
            attempt,
            resetTime,
            waitTimeMs: Math.max(0, resetTime - Date.now()),
          });

          await waitUntil(resetTime);

          AppLogger.info("Retrying operation after rate limit reset", {
            operation: operationName,
            attempt: attempt + 1,
          });

          continue;
        }

        // If no reset time available, wait 1 second (fallback)
        AppLogger.info(
          "Rate limited but no reset time available, waiting 1 second",
          {
            operation: operationName,
            attempt,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // For non-rate-limit errors or if we've exhausted retries, return the error
      return result;
    }

    // Success case
    if (attempt > 0) {
      AppLogger.info("Operation succeeded after retry", {
        operation: operationName,
        attempt,
      });
    }
    return result;
  }

  // If we get here, we exhausted all retries due to rate limiting
  AppLogger.error("Operation failed after retries due to rate limiting", {
    operation: operationName,
    maxRetries,
  });

  return Err(
    lastError ||
      new AppError({
        message: `Operation failed after ${maxRetries} retries`,
        code: "RATE_LIMITED",
      }),
  );
};
