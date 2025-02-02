import type { Videos } from "../domain";
import type { IAppContext } from "../infra/dependency";
import type { AppError, Result } from "../pkg/errors";

export type SendMessageParams = {
  channelIds: string[];
  content: string;
  videos: Videos;
};

export type RetryErrorChannelId = string;

export interface IDiscordInteractor {
  batchSendMessages(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>>;
}

export class DiscordInteractor implements IDiscordInteractor {
  constructor(private readonly context: IAppContext) {}

  async batchSendMessages(
    params: SendMessageParams,
  ): Promise<Result<RetryErrorChannelId[], AppError>> {
    return this.context.runInTx(async (_repos, services) => {
      const sv =
        await services.discordService.sendVideosToMultipleChannels(params);
      if (sv.err) {
        return sv;
      }
      return sv;
    });
  }
}
