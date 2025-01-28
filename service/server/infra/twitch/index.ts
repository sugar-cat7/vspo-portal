import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { createVideo, createVideos, Videos } from '../../domain/video';
import { Result, AppError, Err, Ok, wrap } from '../../pkg/errors';
import { convertToUTC } from '../../pkg/dayjs';

type TwitchServiceConfig = {
    clientId: string;
    clientSecret: string;
}

type GetStreamsParams =  { userIds: string[] }
type GetVideosByIDsParams = { videoIds: string[] }

export interface ITwitchService {
    getStreams(params: GetStreamsParams): Promise<Result<Videos, AppError>>;
    getVideosByIDs(params: GetVideosByIDsParams): Promise<Result<Videos, AppError>>;
}

export class TwitchService implements ITwitchService {
    private apiClient: ApiClient;

    constructor(config: TwitchServiceConfig) {
        const authProvider = new AppTokenAuthProvider(config.clientId, config.clientSecret);
        this.apiClient = new ApiClient({ authProvider });
    }

    async getStreams(params: GetStreamsParams): Promise<Result<Videos, AppError>> {
        const streamsResult = await wrap(
            this.apiClient.streams.getStreams({ userId: '858359149' }),
            (err) => new AppError({
                message: `Network error while fetching streams: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );
        if (streamsResult.err) {
            return Err(streamsResult.err);
        }
        const streams = streamsResult.val;
        if (!streams.data) {
            return Ok(createVideos([]));
        }

        return Ok(createVideos(streams.data.map((video) => createVideo({
            id: '',
            rawId: video.id,
            rawChannelID: video.userId,
            title: video.title,
            description: video.title,
            publishedAt: convertToUTC(video.startDate),
            startedAt: convertToUTC(video.startDate),
            endedAt: null,
            platform: 'twitch',
            status: 'live',
            tags: video.tags,
            viewCount: video.viewers,
            thumbnailURL: video.thumbnailUrl,
            videoType: 'vspo_stream',
        }))));
    }

    async getVideosByIDs(params: GetVideosByIDsParams): Promise<Result<Videos, AppError>> {
        const videosResult = await wrap(
            this.apiClient.videos.getVideosByIds(params.videoIds),
            (err) => new AppError({
                message: `Network error while fetching videos by IDs: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );

        if (videosResult.err) {
            return Err(videosResult.err);
        }

        const videos = videosResult.val;
        return Ok(createVideos(videos.map((video) => createVideo({
            id: '',
            rawId: video.id,
            rawChannelID: video.userId,
            title: video.title,
            description: video.description,
            publishedAt: convertToUTC(video.publishDate),
            startedAt: convertToUTC(video.creationDate),
            endedAt: null,
            platform: 'twitch',
            status: 'ended',
            tags: [],
            viewCount: 0,
            thumbnailURL: video.thumbnailUrl,
            videoType: 'vspo_stream',
        }))));
    }
}
