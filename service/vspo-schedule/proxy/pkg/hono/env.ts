import type { Env } from "@/pkg/env";
import type { CustomLogger } from "@/pkg/logging";
import { Tracer } from "@opentelemetry/api";

export type ServiceContext = {
    logger: CustomLogger;
    tracer: Tracer
};

export type HonoEnv = {
    Bindings: {
        env: Env;
    };
    Variables: {
        requestId: string;
        requestUrl: string;
        services: ServiceContext;
    };
};
