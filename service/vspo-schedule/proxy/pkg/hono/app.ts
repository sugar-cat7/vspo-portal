import { prettyJSON } from "hono/pretty-json";
import { handleError } from "@/pkg/errors";
import type { HonoEnv } from "./env";
import { Hono, type Context, type Input } from "hono";

export const newApp = () => {
  const app = new Hono<HonoEnv>();

  app.use(prettyJSON());
  app.onError(handleError);
  return app;
};

export type App = ReturnType<typeof newApp>;
export type AppContext<P extends string = "/", I extends Input = {}> = Context<
  HonoEnv,
  P,
  I
>;
