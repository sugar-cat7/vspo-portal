import { prettyJSON } from "hono/pretty-json";
import type { HonoEnv } from "./env";
import { Hono, type Context, type Input } from "hono";

export const newApp = () => {
  const app = new Hono<HonoEnv>();

  app.use(prettyJSON());
  return app;
};

export type App = ReturnType<typeof newApp>;
export type AppContext<P extends string = "/", I extends Input = {}> = Context<
  HonoEnv,
  P,
  I
>;
