import { createRoute } from '@hono/zod-openapi'
import { example, insertExampleSchema } from '../pkg/db/sqlite'
import { AppError, ErrorCodeSchema, openApiErrorResponses, wrap } from '../pkg/errors'
import type { App } from '../pkg/hono/app'
import { CreateExampleRequestSchema, CreateExampleResponseSchema } from './schema/http'

const postExampleRoute = createRoute({
  tags: ['example'],
  operationId: 'exampleKey',
  method: 'post' as const,
  path: '/example',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateExampleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'The configuration for an api',
      content: {
        'application/json': {
          schema: CreateExampleResponseSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
})

export const registerExamplePostApi = (app: App) =>
  app.openapi(postExampleRoute, async (c) => {
    const { tracer, db } = c.get('services')
    const req = CreateExampleRequestSchema.safeParse(await c.req.json())
    // OTel用のSpanを開始
    return tracer.startActiveSpan('postStreamRoute', async (span) => {
      // NOTE: ロジックここから

      // 保存対象
      const exampleObject = {
        ...req.data,
        id: crypto.randomUUID(),
      }

      // --- R2 保存例 ---
      // Bindingされている環境変数からr2を操作できる
      const r2 = c.env.APP_BUCKET
      await r2.put('example', JSON.stringify(exampleObject))
      const getR2 = await r2.get('example')
      const text = await getR2?.text()
      console.info(`R2 example: ${text}`)

      // --- queue 例 ---
      // Bindingされている環境変数からqueueを操作できる
      const queue = c.env.APP_QUEUE
      await queue.send('example')
      // entrypoint: services/api-server/pkg/otel/cloudflare.ts

      // --- KV 例 ---
      // Bindingされている環境変数からKVを操作できる
      const kv = c.env.APP_KV
      await kv.put('example', JSON.stringify(exampleObject))
      const getKV = await kv.get('example')
      console.info(`KV example: ${getKV}`)

      // ---- D1 保存例 ----
      const insertRow = insertExampleSchema.parse(exampleObject)
      // トランザクションはBatch Statementで実行
      // https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/#dbbatch
      // https://orm.drizzle.team/docs/batch-api
      const batchResponse = await wrap(
        db.batch([db.insert(example).values(insertRow).returning()]),
        (e) =>
          new AppError({
            message: `Failed to execute batch operation: ${e.message}`,
            code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
          })
      )

      if (batchResponse.err) {
        throw batchResponse.err
      }

      return c.json(CreateExampleResponseSchema.parse(batchResponse.val.at(0)?.at(0)), 200)
    })
  })
