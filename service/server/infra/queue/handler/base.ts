export interface QueueHandler {
  process(messages: unknown[]): Promise<void>;
}
