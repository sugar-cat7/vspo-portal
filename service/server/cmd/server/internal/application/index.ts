import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import { Env, zEnv } from "../../../../config/env";
import { Container } from "../../../../infra/dependency";
import { BatchUpsertByChannelIdsParam, BatchUpsertByIdsParam, BatchUpsertBySearchParam, BatchUpsertParam, ICreatorInteractor, IVideoInteractor, ListByMemberTypeParam, ListParam, SearchExistParam, SearchLiveParam, VideoInteractor } from "../../../../usecase";


export class VideoService extends RpcTarget {
  #usecase: IVideoInteractor;
  constructor(usecase: IVideoInteractor){
    super();
    this.#usecase = usecase;
  }
  
  async batchUpsert(params: BatchUpsertParam) {
    return this.#usecase.batchUpsert(params);
  }

  async searchLive(params: SearchLiveParam) {
    return this.#usecase.searchLive(params);
  }

  async searchExist(params: SearchExistParam) {
    return this.#usecase.searchExist(params);
  }

  async batchUpsertByIds(params: BatchUpsertByIdsParam) {
    return this.#usecase.batchUpsertByIds(params);
  }

  async list(params: ListParam) {
    return this.#usecase.list(params);
  }

  async searchDeleted(params: {}) {
    return this.#usecase.searchDeleted(params);
  }

}

export class CreatorService extends RpcTarget {
  #usecase: ICreatorInteractor

  constructor(usecase: ICreatorInteractor){
    super();
    this.#usecase = usecase;
  }

  async batchUpsertByChannelIds(params: BatchUpsertByChannelIdsParam) {
    return this.#usecase.batchUpsertByChannelIds(params);
  }

  async batchUpsertBySearch(params: BatchUpsertBySearchParam) {
    return this.#usecase.batchUpsertBySearch(params);
  }

  async list(params: ListByMemberTypeParam) {
    return this.#usecase.list(params);
  }
  

}

export class ApplicationService extends WorkerEntrypoint<Env> {

  newVideoUsecase() {
    const d = this.setup();
    return new VideoService(d.videoInteractor)
  }
  
  newCreatorUsecase() {
    const d = this.setup();
    return new CreatorService(d.creatorInteractor)
  }

  private setup() {
    const envResult = zEnv.safeParse(this.env);
    if (!envResult.success) {
      throw new Error("Failed to parse environment variables");
    }
    return new Container(envResult.data);
  }
}

export default {
  async fetch() {
    return new Response("ok");
  },
};
