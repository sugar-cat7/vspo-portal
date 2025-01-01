import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import type { Context, Input } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { prettyJSON } from 'hono/pretty-json'
import { handleError, handleZodError } from '../errors'
import type { HonoEnv } from './env'

export const newApp = () => {
  const app = new OpenAPIHono<HonoEnv>({
    defaultHook: handleZodError,
  })

  app.use(prettyJSON(), contextStorage())
  app.onError(handleError)
  app.use('/swagger-ui')
  app.use('/doc')
  app.doc('/doc', {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'api',
      description: 'API',
    },
  })
  app.get('/swagger-ui', swaggerUI({ url: '/doc' }))

  app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    bearerFormat: 'root key',
    type: 'http',
    scheme: 'bearer',
  })
  return app
}

export type App = ReturnType<typeof newApp>
export type AppContext = Context<HonoEnv>
