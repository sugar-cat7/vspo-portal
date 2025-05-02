import { type ResolveConfigFn, instrument } from "@microlabs/otel-cf-workers";
import type { Span } from "@opentelemetry/api";
import * as Sentry from "@sentry/cloudflare";
import { AppError } from "@vspo-lab/error";
import { Err, type Result } from "@vspo-lab/error";
import { AppLogger } from "@vspo-lab/logging";
import type { ApiEnv } from "../../../config/env/api";
import type { CommonEnv } from "../../../config/env/common";
import type { AppWorkerEnv } from "../../../config/env/internal";
import type { BindingWorkflowEnv } from "../../../config/env/workflow";

export const withTracerResult = async <T, E extends AppError = AppError>(
  tracerName: string,
  spanName: string,
  callback: (span: Span) => Promise<Result<T, E>>,
): Promise<Result<T, E>> => {
  return Sentry.startSpan(
    {
      name: spanName,
    },
    async (span) => {
      const traceId = span.spanContext().traceId;
      const spanId = span.spanContext().spanId;

      AppLogger.info(spanName, {
        trace_id: traceId,
        span_id: spanId,
        tracer_name: tracerName,
      });

      return await AppLogger.runWithContext(
        {
          additionalFields: {
            trace_id: traceId,
            span_id: spanId,
            tracer_name: tracerName,
            span_name: spanName,
          },
        },
        async () => {
          try {
            const result = await callback(span);
            if (result.err) {
              span.recordException(result.err);
            }
            return result;
          } catch (error) {
            let appError: E;
            if (error instanceof AppError) {
              appError = error as E;
            } else if (error instanceof Error) {
              appError = new AppError({
                message: "Unexpected error occurred",
                code: "INTERNAL_SERVER_ERROR",
                cause: error,
              }) as E;
            } else {
              appError = new AppError({
                message: "Unknown error occurred",
                code: "INTERNAL_SERVER_ERROR",
                cause: new Error(String(error)),
              }) as E;
            }
            span.recordException(appError);
            Sentry.captureException(appError);
            return Err(appError);
          } finally {
            span.end();
          }
        },
      );
    },
  );
};

export const withTracer = async <T>(
  tracerName: string,
  spanName: string,
  callback: (span: Span) => Promise<T>,
): Promise<T> => {
  return Sentry.startSpan(
    {
      name: spanName,
    },
    async (span) => {
      const traceId = span.spanContext().traceId;
      const spanId = span.spanContext().spanId;

      AppLogger.info(spanName, {
        trace_id: traceId,
        span_id: spanId,
        tracer_name: tracerName,
      });

      return await AppLogger.runWithContext(
        {
          additionalFields: {
            trace_id: traceId,
            span_id: spanId,
            tracer_name: tracerName,
            span_name: spanName,
          },
        },
        async () => {
          try {
            return await callback(span);
          } catch (error) {
            span.recordException(error);
            Sentry.captureException(error);
            throw error;
          } finally {
            span.end();
          }
        },
      );
    },
  );
};

const config: ResolveConfigFn = (env: CommonEnv, _trigger) => {
  return {
    exporter: {
      url: env.OTEL_EXPORTER_URL,
      headers: { "x-api-key": env.BASELIME_API_KEY },
    },
    service: { name: env.SERVICE_NAME },
  };
};

export type UnifiedEnv = CommonEnv & ApiEnv & AppWorkerEnv & BindingWorkflowEnv;

type Handler<T = unknown, E = UnifiedEnv> = {
  fetch?: (req: Request, env: E, ctx: ExecutionContext) => Promise<Response>;
  queue?: (
    batch: MessageBatch<T>,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<void>;
  scheduled?: (
    controller: ScheduledController,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<void>;
};

export const createHandler = <T, E extends UnifiedEnv = UnifiedEnv>(
  handler: Handler<T, E>,
) => {
  const instrumentedHandler = instrument(handler, config);
  return Sentry.withSentry(
    (env) => ({
      dsn: env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      beforeSend: (event) => {
        event.tags = {
          ...event.tags,
          request_id: AppLogger.getCurrentRequestId(),
          trace_id: String(AppLogger.getAdditionalFields()?.trace_id ?? ""),
          span_id: String(AppLogger.getAdditionalFields()?.span_id ?? ""),
          tracer_name: String(
            AppLogger.getAdditionalFields()?.tracer_name ?? "",
          ),
          span_name: String(AppLogger.getAdditionalFields()?.span_name ?? ""),
        };
        return event;
      },
    }),
    // https://docs.sentry.io/platforms/javascript/guides/cloudflare/#setup-cloudflare-workers
    instrumentedHandler as unknown as ExportedHandler<E>,
  );
};
