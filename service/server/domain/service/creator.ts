import { type Creator, type Creators, createCreator } from "..";
import type { ICreatorRepository, IYoutubeService } from "../../infra";
import type { IAIService } from "../../infra/ai";
import { type AppError, Ok, type Result } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";

export interface ICreatorService {
  searchCreatorsByMemberType(params: {
    memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
  }): Promise<Result<Creators, AppError>>;
  searchCreatorsByChannelIds(
    params: {
      channelId: string;
      memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
    }[],
  ): Promise<Result<Creators, AppError>>;
  translateCreators({
    languageCode,
    creators,
  }: {
    languageCode: string;
    creators: Creators;
  }): Promise<Result<Creators, AppError>>;
}

export class CreatorService implements ICreatorService {
  constructor(
    private readonly deps: {
      youtubeClient: IYoutubeService;
      creatorRepository: ICreatorRepository;
      aiService: IAIService;
    },
  ) {}

  async searchCreatorsByMemberType(params: {
    memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
  }): Promise<Result<Creators, AppError>> {
    const c = await this.deps.creatorRepository.list({
      limit: 100,
      page: 0,
      memberType: params.memberType,
    });
    if (c.err) {
      return c;
    }

    const chs = await this.deps.youtubeClient.getChannels({
      channelIds: c.val
        .map((v) => v.channel?.youtube?.rawId)
        .filter((v) => v !== undefined),
    });

    if (chs.err) {
      return chs;
    }

    const creators = c.val
      .map((v) => {
        const ch = chs.val.find((ch) => ch.id === v.channel?.youtube?.rawId);
        if (!v?.channel || !ch?.youtube) {
          return null;
        }
        const newCreator = createCreator({
          ...v,
          name: ch.youtube.name,
          thumbnailURL: ch.youtube.thumbnailURL,
          channel: {
            ...v.channel,
            youtube: ch.youtube,
          },
        });
        if (this.diff(v, newCreator)) {
          return newCreator;
        }
        return null;
      })
      .filter((v) => v !== null);

    return Ok(creators);
  }

  async searchCreatorsByChannelIds(
    params: {
      channelId: string;
      memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
    }[],
  ): Promise<Result<Creators, AppError>> {
    const chs = await this.deps.youtubeClient.getChannels({
      channelIds: params.map((v) => v.channelId),
    });

    if (chs.err) {
      return chs;
    }

    const creators = [];
    for (const ch of chs.val) {
      if (!ch.youtube) {
        continue;
      }
      const creatorId = createUUID();
      const channelId = createUUID();
      const creator = createCreator({
        id: creatorId,
        name: ch.youtube.name,
        languageCode: "default",
        memberType:
          params.find((v) => v.channelId === ch.id)?.memberType || "general",
        thumbnailURL: ch.youtube.thumbnailURL,
        channel: {
          id: channelId,
          creatorID: creatorId,
          youtube: ch.youtube,
          twitCasting: null,
          twitch: null,
          niconico: null,
        },
      });
      creators.push(creator);
    }

    return Ok(creators);
  }

  async translateCreators({
    languageCode,
    creators,
  }: {
    languageCode: string;
    creators: Creators;
  }): Promise<Result<Creators, AppError>> {
    const translatePromises = creators.map((creator) =>
      this.deps.aiService.translateText(creator.name, languageCode),
    );
    const translatedResults = await Promise.allSettled(translatePromises);
    const translatedCreators = creators.map((creator, i) => {
      const translatedText =
        translatedResults[i].status === "fulfilled"
          ? (translatedResults[i].value.val?.translatedText ?? creator.name)
          : creator.name;
      return { ...creator, name: translatedText, languageCode: languageCode };
    });

    return Ok(translatedCreators);
  }

  private diff(a: Creator, b: Creator): boolean {
    if (a.name !== b.name) {
      return true;
    }
    if (a.memberType !== b.memberType) {
      return true;
    }
    if (a.thumbnailURL !== b.thumbnailURL) {
      return true;
    }
    if (a.channel?.youtube?.rawId !== b.channel?.youtube?.rawId) {
      return true;
    }
    if (a.channel?.youtube?.name !== b.channel?.youtube?.name) {
      return true;
    }
    return false;
  }
}
