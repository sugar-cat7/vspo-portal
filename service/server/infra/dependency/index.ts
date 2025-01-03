import { CreatorService, VideoService } from "../../domain";
import { Env } from "../../pkg/env";
import { CreatorInteractor, VideoInteractor } from "../../usecase";
import { CreatorRepository, VideoRepository } from "../repository";
import { createDB } from "../repository/provider";
import { TwitcastingService } from "../twitcasting";
import { TwitchService } from "../twitch";
import { YoutubeService } from "../youtube";

export class Dependency {
    public videoInteractor: VideoInteractor
    public creatorInteractor: CreatorInteractor
    constructor(private env: Env) {
        const ys = new YoutubeService(this.env.YOUTUBE_API_KEY)
        const ts = new TwitchService({
            clientId: this.env.TWITCH_CLIENT_ID,
            clientSecret: this.env.TWITCH_CLIENT_SECRET
        })
        const tcs = new TwitcastingService(this.env.TWITCASTING_ACCESS_TOKEN)
        const db = createDB({ connectionString: this.env.DB_CONNECTION_STRING })
        const vr = new VideoRepository(db)
        const cr = new CreatorRepository(db)
        const vs = new VideoService({
            youtubeClient: ys,
            twitchClient: ts,
            twitCastingClient: tcs,
            creatorRepository: cr,
            videoRepository: vr
        })
        const cs = new CreatorService({
            youtubeClient: ys,
            creatorRepository: cr
        })
        const vu = new VideoInteractor({
            videoService: vs,
            videoRepository: vr
        })
        const cu = new CreatorInteractor({
            creatorService: cs,
            creatorRepository: cr
        })
        this.videoInteractor = vu
        this.creatorInteractor = cu
    }
}
