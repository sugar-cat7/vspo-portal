import { Videos, createVideos, createVideo } from "../../domain/video";
import { convertToUTC, convertToUTCDate } from "../../pkg/dayjs";
import { Result,AppError, Err, Ok, wrap } from "../../pkg/errors";

type GetVideosParams = {
    userIds: string[];
};

type TwitCastingVideo = {
    id: string;
    userId: string;
    title: string;
    isLive: boolean;
    viewCount: number;
    thumbnailURL: string;
    startedAt: number;
}


export interface ITwitcastingService {
    getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>>;
}

export class TwitcastingService implements ITwitcastingService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    async getVideos(params: GetVideosParams): Promise<Result<Videos, AppError>> {
        let allVideos: Videos = createVideos([]);

        for (const userId of params.userIds) {
            const result = await this.fetchUserVideos(userId);
            if (result.err) {
                return Err(result.err);
            }

            allVideos = createVideos([...allVideos, ...result.val.map((video) => this.createVideoModel(video))]);
        }

        return Ok(allVideos);
    }

    private async fetchUserVideos(userId: string): Promise<Result<TwitCastingVideo[], AppError>> {
        const fetchPromise = fetch(`https://apiv2.twitcasting.tv/users/${userId}/movies?limit=3`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const responseResult = await wrap(fetchPromise, (err) =>
            new AppError({
                message: `Network error while fetching videos for user ${userId}: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR' 
            })
        );
        if (responseResult.err) {
            return responseResult;
        }

        const response = responseResult.val;
        if (!response.ok) {
            return Err(new AppError({
                message: `Failed to fetch videos for user ${userId}: ${response.status} ${response.statusText}`,
                code: 'INTERNAL_SERVER_ERROR'
            }));
        }

        const dataResult = await wrap(response.json(), (err) =>
            new AppError({
                message: `Failed to parse JSON response for user ${userId}: ${err.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            })
        );
        if (dataResult.err) {
            return dataResult;
        }

        const data = dataResult.val;
        if (!this.isValidMoviesResponse(data)) {
            return Err(new AppError({
                message: `Invalid response format for user ${userId}`,
                code: 'INTERNAL_SERVER_ERROR'
            }));
        }

        const videos = data.movies.map((movie: any) => this.mapToTwitCastingVideo(movie));
        return Ok(videos);
    }

    private isValidMoviesResponse(data: any): data is { movies: any[] } {
        return typeof data === 'object' && data !== null && Array.isArray(data.movies);
    }

    private mapToTwitCastingVideo(movie: any): TwitCastingVideo {
        return {
            id: movie.id,
            userId: movie.user.id,
            title: movie.title,
            isLive: movie.is_live,
            viewCount: movie.total_view_count,
            thumbnailURL: movie.large_thumbnail,
            startedAt: movie.created,
        };
    }

    private createVideoModel(video: TwitCastingVideo) {
        return createVideo({
            id: '',
            rawId: video.id,
            rawChannelID: video.userId,
            title: video.title,
            description: video.title,
            publishedAt: convertToUTC(video.startedAt),
            startedAt: convertToUTC(video.startedAt),
            endedAt: null,
            platform: 'twitcasting',
            status: video.isLive ? 'live' : 'ended',
            tags: [],
            viewCount: video.viewCount,
            thumbnailURL: video.thumbnailURL,
            videoType: 'vspo_stream',
        });
    }
}
