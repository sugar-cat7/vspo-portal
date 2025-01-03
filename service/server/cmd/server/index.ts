import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { newApp } from '../../pkg/hono/app'
import { init } from '../../infra/http/hono/middleware'
import {
  registerVideoPostApi
} from '../../routes'
import { createHandler } from '../../infra/http/hono/otel'

const app = newApp()
app.notFound((c) => {
  return c.text('Not Found', 404)
})
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['*'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
  }),
  requestId(),
  init,
)
registerVideoPostApi(app)
export default createHandler(app)
