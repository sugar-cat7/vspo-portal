import { WorkerEntrypoint } from "cloudflare:workers";
import { Env } from "../../../pkg/env";

export class TranslateService extends WorkerEntrypoint<Env> {
  
}

export default {
  async fetch() {
    return new Response("ok");
  },
};