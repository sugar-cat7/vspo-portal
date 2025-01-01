import { BaseError, type ErrorContext } from './base'
import { type ErrorCode, codeToStatus } from './handler'

export class AppError extends BaseError {
  public readonly name = 'AppError'
  public readonly retry: boolean
  public readonly code: ErrorCode
  public readonly status: number

  constructor(opts: {
    message: string
    code: ErrorCode
    cause?: BaseError
    context?: ErrorContext
    retry?: boolean
  }) {
    super({
      message: opts.message,
      cause: opts.cause,
      context: opts.context,
    })
    this.retry = opts.retry ?? false
    this.code = opts.code
    this.status = codeToStatus(opts.code)
  }
}
