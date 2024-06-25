import type { Env } from "@/pkg/env";
import type { CustomLogger } from "@/pkg/logging";
import { TranslationServiceClient } from "@google-cloud/translate";

import { Tracer } from "@opentelemetry/api";

export type ServiceContext = {
    logger: CustomLogger;
    tracer: Tracer
    kv: KVNamespace;
    translator: TranslationServiceClient
};

export type HonoEnv = {
    Bindings: {
        env: Env;
    };
    Variables: {
        requestId: string;
        requestUrl: string;
        gcpProjectPath: string;
        services: ServiceContext;
    };
};
