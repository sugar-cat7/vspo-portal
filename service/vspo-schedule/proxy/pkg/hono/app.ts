import { handleError } from "@/pkg/errors";
import { type Context, Hono, type Input } from "hono";
import { prettyJSON } from "hono/pretty-json";
import type { HonoEnv } from "./env";

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
