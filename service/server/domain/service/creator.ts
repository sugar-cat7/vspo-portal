import { Creators, createCreator } from "..";
import { IYoutubeService, ICreatorRepository } from "../../infra";
import { AppError, Result, Ok } from "../../pkg/errors";
import { createUUID } from "../../pkg/uuid";

export interface ICreatorService {
  searchCreatorsByMemberType(params: { memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general" }): Promise<Result<Creators, AppError>>;
  searchCreatorsByChannelIds(params: { channelId: string, memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general" }[]): Promise<Result<Creators, AppError>>;
}

export class CreatorService implements ICreatorService {
  private youtubeClient: IYoutubeService;
  private creatorRepository: ICreatorRepository;

  constructor({
    youtubeClient,
    creatorRepository,
  }: {
    youtubeClient: IYoutubeService;
    creatorRepository: ICreatorRepository;
  }) {
    this.youtubeClient = youtubeClient;
    this.creatorRepository = creatorRepository;
  }

  async searchCreatorsByMemberType(params: { memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general" }): Promise<Result<Creators, AppError>> {
    const c = await this.creatorRepository.list({ limit: 100, offset: 0, memberType: params.memberType });
    if (c.err) {
      return c;
    }

    const chs = await this.youtubeClient.getChannels({ channelIds: c.val.map(v => v.channel?.youtube?.rawId).filter(v => v !== undefined) });


    if (chs.err) {
      return chs;
    }

    const creators = c.val.map(v => {
      const ch = chs.val.find(ch => ch.id === v.channel?.youtube?.rawId);
      if (!v?.channel || !ch?.youtube) {
        return v;
      }

      return createCreator({
        ...v,
        channel: {
          ...v.channel,
          youtube: ch.youtube
        }
      })
    });

    return Ok(creators);
  }

  async searchCreatorsByChannelIds(params: { channelId: string, memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general"  }[]): Promise<Result<Creators, AppError>> {
    const chs = await this.youtubeClient.getChannels({ channelIds: params.map(v => v.channelId) });

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
        memberType: params.find(v => v.channelId === ch.id)?.memberType || "general",
        thumbnailURL: ch.youtube.thumbnailURL,
        channel: {
          id: channelId,
          creatorID: creatorId,
          youtube: ch.youtube,
          twitCasting: null,
          twitch: null,
          niconico: null,
        }
      });
      creators.push(creator);
    }

    return Ok(creators);
  }
}
