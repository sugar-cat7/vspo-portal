import { AppContext, newApp } from "@/lib/hono";

export const videoRoute = newApp().get("/", (c: AppContext) => {
  return c.json({ name: "test" }, 200);
});
