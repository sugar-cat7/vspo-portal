import { newApp } from "@/lib/hono";
import { handle } from "hono/vercel";
import type { PageConfig } from "next";
import { videoRoute } from "@/internal/api/routes";

export const config: PageConfig = {
  runtime: "edge",
};

const app = newApp().basePath("/api");

const routes = app.route("/videos", videoRoute);

export type AppType = typeof routes;

export default handle(app);
