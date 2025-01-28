import { type ResolveConfigFn, instrument } from "@microlabs/otel-cf-workers";
import { type Span, trace } from "@opentelemetry/api";
import type { ApiEnv } from "../../../config/env/api";
import type { CommonEnv } from "../../../config/env/common";
import type { AppWorkerEnv } from "../../../config/env/internal";
import type { BindingWorkflowEnv } from "../../../config/env/workflow";
import { AppError } from "../../../pkg/errors";

export const withTracer = async <T>(
  tracerName: string,
  spanName: string,
  callback: (span: Span) => Promise<T>,
): Promise<T> => {
  const tracer = trace.getTracer(tracerName);
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      return await callback(span);
    } catch (error) {
      if (error instanceof AppError) {
        span.recordException(error);
      }
      if (error instanceof Error) {
        span.recordException(error);
      } else {
        span.recordException(new Error(String(error)));
      }
      throw error;
    } finally {
      span.end();
    }
  });
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
  return instrument(handler, config);
};
