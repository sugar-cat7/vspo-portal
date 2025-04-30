import { type Clip, ClipsSchema } from "../../../domain/clip";
import { AppLogger } from "../../../pkg/logging";
import type { IClipInteractor } from "../../../usecase/clip";
import { BaseHandler } from "./base";

export type UpsertClip = Clip & { kind: "upsert-clip" };

export class ClipHandler extends BaseHandler<UpsertClip> {
  #clipInteractor: IClipInteractor;

  constructor(clipInteractor: IClipInteractor) {
    super();
    this.#clipInteractor = clipInteractor;
  }

  async processUpsertClip(messages: UpsertClip[]): Promise<void> {
    AppLogger.info(
      `Processing ${messages.length} messages of kind: upsert-clip`,
    );

    const clips = ClipsSchema.safeParse(messages);
    if (!clips.success) {
      AppLogger.error(`Invalid clips: ${clips.error.message}`);
      return;
    }

    const v = await this.#clipInteractor.batchUpsert(clips.data);
    if (v.err) {
      AppLogger.error(`Failed to upsert clips: ${v.err.message}`);
      throw v.err;
    }
  }

  isUpsertClip(message: unknown): message is UpsertClip {
    return (
      typeof message === "object" &&
      message !== null &&
      "kind" in message &&
      message.kind === "upsert-clip"
    );
  }

  async process(messages: unknown[]): Promise<void> {
    const upsertClips: UpsertClip[] = [];

    for (const message of messages) {
      if (this.isUpsertClip(message)) {
        upsertClips.push(message);
      }
    }

    if (upsertClips.length > 0) {
      await this.processUpsertClip(upsertClips);
    }
  }
}
