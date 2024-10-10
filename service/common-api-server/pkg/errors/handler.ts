import { z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'
import type { ZodError } from 'zod'
import type { Env } from '../env'
import type { AppContext } from '../hono'
import type { HonoEnv } from '../hono/env'
import { AppLogger } from '../logging'
import { AppError } from './error'

export const ErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'FORBIDDEN',
  'INTERNAL_SERVER_ERROR',
  'USAGE_EXCEEDED',
  'DISABLED',
  'NOT_FOUND',
  'NOT_UNIQUE',
  'RATE_LIMITED',
  'UNAUTHORIZED',
  'PRECONDITION_FAILED',
  'INSUFFICIENT_PERMISSIONS',
  'METHOD_NOT_ALLOWED',
])

export type ErrorCode = z.infer<typeof ErrorCodeSchema>

const parseZodErrorMessage = (err: z.ZodError): string => {
  try {
    const arr = JSON.parse(err.message) as Array<{
      message: string
      path: Array<string>
    }>
    const { path, message } = arr[0]
    return `${path.join('.')}: ${message}`
  } catch {
    return err.message
  }
}

export const errorSchemaFactory = (code: z.ZodEnum<any>) => {
  return z.object({
    error: z.object({
      code: code.openapi({
        description: 'A machine readable error code.',
        example: code._def.values.at(0),
      }),
      docs: z.string().openapi({
        description: 'A link to our documentation with more details about this error code',
        example: 'https://example.com/docs',
      }),
      message: z
        .string()
        .openapi({ description: 'A human readable explanation of what went wrong' }),
      requestId: z.string().openapi({
        description: 'Please always include the requestId in your error report',
        example: 'req_1234',
      }),
    }),
  })
}

export const ErrorSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema.openapi({
      description: 'A machine readable error code.',
      example: 'INTERNAL_SERVER_ERROR',
    }),
    docs: z.string().openapi({
      description: 'A link to our documentation with more details about this error code',
      example: 'https://example.com/docs',
    }),
    message: z.string().openapi({ description: 'A human readable explanation of what went wrong' }),
    requestId: z.string().openapi({
      description: 'Please always include the requestId in your error report',
      example: 'req_1234',
    }),
  }),
})

export type ErrorResponse = z.infer<typeof ErrorSchema>

export const codeToStatus = (code: ErrorCode): StatusCode => {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'FORBIDDEN':
    case 'DISABLED':
    case 'UNAUTHORIZED':
    case 'INSUFFICIENT_PERMISSIONS':
    case 'USAGE_EXCEEDED':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'METHOD_NOT_ALLOWED':
      return 405
    case 'NOT_UNIQUE':
      return 409
    case 'PRECONDITION_FAILED':
      return 412
    case 'RATE_LIMITED':
      return 429
    case 'INTERNAL_SERVER_ERROR':
      return 500
  }
}

const statusToCode = (status: StatusCode): ErrorCode => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'

    case 404:
      return 'NOT_FOUND'

    case 405:
      return 'METHOD_NOT_ALLOWED'
    case 500:
      return 'INTERNAL_SERVER_ERROR'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

export const handleZodError = (
  result:
    | {
        success: true
        data: any
      }
    | {
        success: false
        error: ZodError
      },
  c: Context<HonoEnv>
) => {
  if (!result.success) {
    return c.json<ErrorResponse, StatusCode>(
      {
        error: {
          code: 'BAD_REQUEST',
          docs: 'https://example.com/docs',
          message: parseZodErrorMessage(result.error),
          requestId: c.get('requestId'),
        },
      },
      { status: 400 }
    )
  }
}

export const handleError = (err: Error, c: Context<HonoEnv>): Response => {
  const e = env<Env, AppContext>(c)
  const logger = new AppLogger({
    env: e,
    requestId: c.get('requestId'),
  })

  if (err instanceof AppError) {
    logger.error(err.message, {
      name: err.name,
      code: err.code,
      status: err.status,
      retry: err.retry,
      requestId: c.get('requestId'),
    })

    return c.json<ErrorResponse, StatusCode>(
      {
        error: {
          code: err.code,
          docs: 'https://example.com/docs',
          message: err.message,
          requestId: c.get('requestId'),
        },
      },
      { status: err.status }
    )
  }

  /**
   * HTTPExceptions from hono at least give us some idea of what to do as they provide a status and
   * message
   */
  if (err instanceof HTTPException) {
    if (err.status >= 500) {
      logger.error(err.message, {
        name: err.name,
        status: err.status,
        requestId: c.get('requestId'),
      })
    }
    const code = statusToCode(err.status)
    return c.json<ErrorResponse, StatusCode>(
      {
        error: {
          code,
          docs: 'https://example.com/docs',
          message: err.message,
          requestId: c.get('requestId'),
        },
      },
      { status: err.status }
    )
  }

  logger.error('unhandled exception', {
    name: err.name,
    message: err.message,
    cause: err.cause,
    stack: err.stack,
    requestId: c.get('requestId'),
  })
  return c.json<ErrorResponse, StatusCode>(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        docs: 'https://example.com/docs',
        message: err.message ?? 'something unexpected happened',
        requestId: c.get('requestId'),
      },
    },
    { status: 500 }
  )
}

export const errorResponse = (c: Context, code: ErrorCode, message: string) => {
  return c.json<ErrorResponse, StatusCode>(
    {
      error: {
        code: code,
        docs: 'https://example.com/docs',
        message,
        requestId: c.get('requestId'),
      },
    },
    { status: codeToStatus(code) }
  )
}
