import { newApp } from "@/pkg/hono/app";
import { init } from "@/pkg/middleware";
import { createHandler } from "@/pkg/otel";

const app = newApp();
app.notFound((c) => {
    return c.text('Not Found', 404)
})
app.use("*", init())

app.get('*', (c) => {
    // TODO: implement proxy
    return fetch(c.get('requestUrl'))
})


export default createHandler(app);
