import { RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import { Env, zEnv } from "../../../config/env";
import { Dependency } from "../../../infra/dependency";

export class ApplicationService extends WorkerEntrypoint<Env> {

  newVideoUsecase() {
    const d = this.setup();
    return d.videoInteractor
  }
  
  newCreatorUsecase() {
    const d = this.setup();
    return d.creatorInteractor
  }

  private setup() {
    const envResult = zEnv.safeParse(this.env);
    if (!envResult.success) {
      throw new Error("Failed to parse environment variables");
    }
    return new Dependency(this.env);
  }
}

export default {
  async fetch() {
    return new Response("ok");
  },
};
