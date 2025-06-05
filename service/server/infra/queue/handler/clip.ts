import { AppLogger } from "@vspo-lab/logging";
import { type Clip, ClipsSchema } from "../../../domain/clip";
import type { IClipInteractor } from "../../../usecase/clip";
import type { QueueHandler } from "./base";

export type UpsertClip = Clip & { kind: "upsert-clip" };

// Type guard function
export function isUpsertClip(message: unknown): message is UpsertClip {
  return (
    typeof message === "object" &&
    message !== null &&
    "kind" in message &&
    message.kind === "upsert-clip"
  );
}

export function createClipHandler(
  clipInteractor: IClipInteractor,
): QueueHandler {
  async function processUpsertClip(messages: UpsertClip[]): Promise<void> {
    AppLogger.info(
      `Processing ${messages.length} messages of kind: upsert-clip`,
    );

    const clips = ClipsSchema.safeParse(messages);
    if (!clips.success) {
      AppLogger.error(`Invalid clips: ${clips.error.message}`);
      return;
    }

    const v = await clipInteractor.batchUpsert(clips.data);
    if (v.err) {
      AppLogger.error(`Failed to upsert clips: ${v.err.message}`);
      throw v.err;
    }
  }

  return {
    async process(messages: unknown[]): Promise<void> {
      const upsertClips: UpsertClip[] = [];

      for (const message of messages) {
        if (isUpsertClip(message)) {
          upsertClips.push(message);
        }
      }

      if (upsertClips.length > 0) {
        await processUpsertClip(upsertClips);
      }
    },
  };
}
