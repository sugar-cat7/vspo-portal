import { ICreatorService } from "../domain";
import { Creators } from "../domain/creator";
import { ICreatorRepository } from "../infra";
import { AppError, Ok, Result } from "../pkg/errors";

type BatchUpsertByChannelIdsParam = {
    channel: {
        id: string
        memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general"
    }[]
}

type BatchUpsertBySearchParam = {
    memberType: "vspo_jp"| "vspo_en"| "vspo_ch"| "general"
}


interface ICreatorInteractor {
    batchUpsertByChannelIds(params: BatchUpsertByChannelIdsParam): Promise<Result<Creators, AppError>>;
    batchUpsertBySearch(params: BatchUpsertBySearchParam): Promise<Result<Creators, AppError>>;
}

export class CreatorInteractor implements ICreatorInteractor {
    private creatorService: ICreatorService;
    private creatorRepository: ICreatorRepository;
  
    constructor({
        creatorService,
        creatorRepository
    }: {
        creatorService: ICreatorService;
        creatorRepository: ICreatorRepository
    }) {
        this.creatorService = creatorService;
        this.creatorRepository = creatorRepository;
    }

    async batchUpsertByChannelIds(params: BatchUpsertByChannelIdsParam): Promise<Result<Creators, AppError>> {
        const sv = await this.creatorService.searchCreatorsByChannelIds(params.channel.map(v => ({ channelId: v.id, memberType: v.memberType })))
        if (sv.err) {
            return sv
        }

        const uv = await this.creatorRepository.batchUpsert(sv.val)
        if (uv.err) {
            return uv
        }
        return Ok(uv.val)
    }

    async batchUpsertBySearch(params: BatchUpsertBySearchParam): Promise<Result<Creators, AppError>> {
        const sv = await this.creatorService.searchCreatorsByMemberType({ memberType: params.memberType })
        if (sv.err) {
            return sv
        }

        const uv = await this.creatorRepository.batchUpsert(sv.val)
        if (uv.err) {
            return uv
        }
        return Ok(uv.val)
    }
}
