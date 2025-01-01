import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { newApp } from '../../pkg/hono/app'
import { init } from '../../pkg/middleware'
import { createHandler } from '../../pkg/otel'
import {
  registerExampleAIEmbeddingsPostApi,
  registerExampleAIRetrievePostApi,
  registerExamplePostApi,
  registerStreamPostApi,
} from '../../routes'

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
  init()
)

registerExamplePostApi(app)
registerExampleAIEmbeddingsPostApi(app)
registerExampleAIRetrievePostApi(app)
registerStreamPostApi(app)

export default createHandler(app)
