import {
  type Creator,
  type Creators,
  MemberTypeSchema,
  createCreator,
} from "..";
import { type ITwitchService, type IYoutubeService, query } from "../../infra";
import { withTracerResult } from "../../infra/http/trace/cloudflare";
import type { ICreatorRepository } from "../../infra/repository/creator";
import {
  type AppError,
  Ok,
  type OkResult,
  type Result,
} from "../../pkg/errors";
import { AppLogger } from "../../pkg/logging";
import { createUUID } from "../../pkg/uuid";
import { type Clips, isVspoClip } from "../clip";

export interface IClipService {
  searchNewVspoClipsAndNewCreators(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  >;
  searchExistVspoClips({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  >;
}

export class ClipService implements IClipService {
  private readonly SERVICE_NAME = "ClipService";

  constructor(
    private readonly deps: {
      youtubeClient: IYoutubeService;
      twitchClient: ITwitchService;
      creatorRepository: ICreatorRepository;
    },
  ) {}

  async searchNewVspoClipsAndNewCreators(): Promise<
    Result<{ newCreators: Creators; clips: Clips }, AppError>
  > {
    return withTracerResult(
      this.SERVICE_NAME,
      "searchNewVspoClipsAndNewCreators",
      async (span) => {
        const clipSearchPromises = [
          this.searchYoutubeVspoClips(),
          this.searchTwitchVspoClips(),
        ];

        const results = await Promise.allSettled(clipSearchPromises);

        const successResults = results
          .filter(
            (r): r is PromiseFulfilledResult<OkResult<Clips>> =>
              r.status === "fulfilled" && r.value.err === undefined,
          )
          .map((r) => r.value.val);

        const failedResults = results.filter(
          (
            r,
          ): r is
            | PromiseRejectedResult
            | PromiseFulfilledResult<Result<Clips, AppError>> =>
            r.status === "rejected" ||
            (r.status === "fulfilled" && r.value.err !== undefined),
        );

        if (failedResults.length > 0) {
          AppLogger.warn("Some clip searches failed", {
            service: this.SERVICE_NAME,
            failedCount: failedResults.length,
            errors: failedResults.map((r) =>
              r.status === "rejected" ? r.reason : r.value.err,
            ),
          });
        }

        if (successResults.length === 0) {
          return Ok({
            newCreators: [],
            clips: [],
          });
        }

        // Merge all clips from different platforms
        const vspoClips = successResults.flat();

        const uniqueChannelIds = new Set<string>();
        const notExistsChannelIds: string[] = [];
        for (const clip of vspoClips) {
          if (uniqueChannelIds.has(clip.rawChannelID)) {
            continue;
          }
          const cs = await this.deps.creatorRepository.existsByChannelId(
            clip.rawChannelID,
          );
          if (cs.err) {
            AppLogger.warn("Failed to check if channel exists", {
              service: this.SERVICE_NAME,
              error: cs.err,
            });
          }
          uniqueChannelIds.add(clip.rawChannelID);
          if (!cs.val && clip.platform === "youtube") {
            notExistsChannelIds.push(clip.rawChannelID);
          }
        }

        const ytChannels = await this.deps.youtubeClient.getChannels({
          channelIds: notExistsChannelIds,
        });
        if (ytChannels.err) {
          return ytChannels;
        }

        const newCreators: Creators = [];
        for (const ytChannel of ytChannels.val) {
          const creatorId = createUUID();
          newCreators.push(
            createCreator({
              id: creatorId,
              name: ytChannel.youtube?.name ?? "",
              languageCode: "default",
              memberType: "general",
              thumbnailURL: ytChannel.youtube?.thumbnailURL ?? "",
              channel: {
                id: createUUID(),
                youtube: {
                  rawId: ytChannel.id,
                  description: ytChannel.youtube?.description ?? "",
                  publishedAt: ytChannel.youtube?.publishedAt ?? "",
                  name: ytChannel.youtube?.name ?? "",
                  thumbnailURL: ytChannel.youtube?.thumbnailURL ?? "",
                  subscriberCount: ytChannel.youtube?.subscriberCount ?? 0,
                },
                twitch: null,
                twitCasting: null,
                niconico: null,
                creatorID: creatorId,
              },
            }),
          );
        }

        return Ok({
          newCreators,
          clips: vspoClips,
        });
      },
    );
  }

  async searchExistVspoClips({
    clipIds,
  }: { clipIds: string[] }): Promise<
    Result<{ clips: Clips; notExistsClipIds: string[] }, AppError>
  > {
    const clipsResult = await this.deps.youtubeClient.getClips({
      videoIds: clipIds,
    });
    if (clipsResult.err) {
      return clipsResult;
    }
    const clips = clipsResult.val;
    const notExistsClipIds = clipIds.filter(
      (id) => !clips.some((c) => c.rawId === id),
    );
    return Ok({
      clips,
      notExistsClipIds,
    });
  }

  private async searchYoutubeVspoClips(): Promise<Result<Clips, AppError>> {
    AppLogger.info("Searching Vspo related YouTube clips", {
      service: this.SERVICE_NAME,
    });

    const promises = [
      this.deps.youtubeClient.searchClips({
        query: query.VSPO_JP_CLIP,
        order: "date",
      }),
      this.deps.youtubeClient.searchClips({
        query: query.VSPO_JP_CLIP,
        order: "relevance",
      }),
      this.deps.youtubeClient.searchClips({
        query: query.VSPO_EN_CLIP,
        order: "date",
      }),
      this.deps.youtubeClient.searchClips({
        query: query.VSPO_EN_CLIP,
        order: "relevance",
      }),
    ];

    const results = await Promise.allSettled(promises);
    const scs = results
      .filter(
        (r): r is PromiseFulfilledResult<OkResult<Clips>> =>
          r.status === "fulfilled" && !r.value.err,
      )
      .flatMap((r) => r.value.val);
    const failedResults = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    if (failedResults.length > 0) {
      AppLogger.warn("Some YouTube stream searches failed", {
        service: this.SERVICE_NAME,
        failedCount: failedResults.length,
        errors: failedResults.map((r) => r.reason),
      });
    }

    const clipIds = scs.map((c) => c.rawId);

    const clips = await this.deps.youtubeClient.getClips({
      videoIds: clipIds,
    });
    if (clips.err) {
      return clips;
    }

    // Filter clips that are related to Vspo
    // Ideally we would want to make a strict determination, but currently we're only checking if the license number exists
    const vspoClips = clips.val.filter((clip) => isVspoClip(clip));

    return Ok(vspoClips);
  }

  private async searchTwitchVspoClips(): Promise<Result<Clips, AppError>> {
    AppLogger.info("Searching Vspo related Twitch clips", {
      service: this.SERVICE_NAME,
    });

    const cs = await this.masterCreators();
    if (cs.err) {
      return cs;
    }
    const twitchIds = cs.val.jp
      .map((c) => c.channel?.twitch?.rawId ?? "")
      .concat(cs.val.en.map((c) => c.channel?.twitch?.rawId ?? ""))
      .filter((id) => id !== "");

    const batchSize = 5;
    const allClips: Clips = [];

    for (let i = 0; i < twitchIds.length; i += batchSize) {
      const batch = twitchIds.slice(i, i + batchSize);
      const batchPromises = batch.map((id) =>
        this.deps.twitchClient.getClipsByUserID({
          userId: id,
        }),
      );

      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        if (result.err) {
          continue;
        }
        allClips.push(...result.val);
      }
    }

    return Ok(allClips);
  }

  private async masterCreators(): Promise<
    Result<{ jp: Creator[]; en: Creator[] }, AppError>
  > {
    const jpCreators = await this.deps.creatorRepository.list({
      limit: 300,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_jp,
      languageCode: "default",
    });
    if (jpCreators.err) {
      return jpCreators;
    }

    const enCreators = await this.deps.creatorRepository.list({
      limit: 300,
      page: 0,
      memberType: MemberTypeSchema.Enum.vspo_en,
      languageCode: "default",
    });
    if (enCreators.err) {
      return enCreators;
    }

    return Ok({ jp: jpCreators.val, en: enCreators.val });
  }
}
