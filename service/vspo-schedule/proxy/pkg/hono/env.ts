import type { Env } from "@/pkg/env";
import type { CustomLogger } from "@/pkg/logging";

import { Tracer } from "@opentelemetry/api";

export type ServiceContext = {
    logger: CustomLogger;
    tracer: Tracer
    kv: KVNamespace;
};

export type HonoEnv = {
    Bindings: {
        env: Env;
    };
    Variables: {
        requestId: string;
        requestUrl: string;
        translateUrl: string;
        services: ServiceContext;
    };
};
