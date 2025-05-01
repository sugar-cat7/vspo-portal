export abstract class BaseHandler<T> {
  abstract process(messages: unknown[]): Promise<void>;
}
