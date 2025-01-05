import { IVideoService } from "../domain";
import { Videos } from "../domain/video";
import { IVideoRepository } from "../infra";
import { AppError, Ok, Result } from "../pkg/errors";

type BatchUpsertParam = Videos
type BatchUpsertBySearchLiveParam = {}
type BatchUpsertBySearchExistParam = {}
type BatchUpsertByIdsParam = {
    youtubeVideoIds: string[]
    twitchVideoIds: string[]
}


interface IVideoInteractor {
    batchUpsert(params: BatchUpsertParam): Promise<Result<Videos, AppError>>;
    batchUpsertBySearchLive(params: BatchUpsertBySearchLiveParam): Promise<Result<Videos, AppError>>;
    batchUpsertBySearchExist(params: BatchUpsertBySearchExistParam): Promise<Result<Videos, AppError>>;
    batchUpsertByIds(params: BatchUpsertByIdsParam): Promise<Result<Videos, AppError>>;
}

export class VideoInteractor implements IVideoInteractor {
    private videoService: IVideoService;
    private videoRepository: IVideoRepository;
  
    constructor({
        videoService,
        videoRepository
    }: {
        videoService: IVideoService;
        videoRepository: IVideoRepository
    }) {
        this.videoService = videoService;
        this.videoRepository = videoRepository;
    }
    
    // Fetch new videos from external APIs
    async batchUpsertBySearchLive(params: BatchUpsertBySearchLiveParam): Promise<Result<Videos, AppError>> {
        const sv = await this.videoService.searchAllLiveVideos()
        if (sv.err) {
            return sv
        }

        // const uv = await this.videoRepository.batchUpsert(sv.val)
        // if (uv.err) {
        //     return uv
        // }
        return Ok(sv.val)
    }

    // Fetch videos from database and external APIs
    async batchUpsertBySearchExist(params: BatchUpsertBySearchExistParam): Promise<Result<Videos, AppError>> {
        const sv = await this.videoService.searchExistVideos()
        if (sv.err) {
            return sv
        }

        // const uv = await this.videoRepository.batchUpsert(sv.val)
        // if (uv.err) {
        //     return uv
        // }
        return Ok(sv.val)
    }

    async batchUpsertByIds(params: BatchUpsertByIdsParam): Promise<Result<Videos, AppError>> {
        const sv = await this.videoService.getVideosByIDs({
            youtubeVideoIds: params.youtubeVideoIds,
            twitchVideoIds: params.twitchVideoIds
        })
        if (sv.err) {
            return sv
        }

        const uv = await this.videoRepository.batchUpsert(sv.val)
        if (uv.err) {
            return uv
        }
        return Ok(uv.val)
    }

    async batchUpsert(params: BatchUpsertParam): Promise<Result<Videos, AppError>> {
        const uv = await this.videoRepository.batchUpsert(params)
        if (uv.err) {
            return uv
        }
        return Ok(uv.val)
    }
}
