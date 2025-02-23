import path from "node:path";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { afterEach } from "vitest";
import { vi } from "vitest";
import { zAppWorkerEnv } from "../config/env/internal";
import { AIService } from "../infra/ai";
import { AppContext } from "../infra/dependency";
import { DiscordClient } from "../infra/discord";
import { channelTable, creatorTable } from "../infra/repository/schema";
import { Ok } from "../pkg/errors";
import { testCreators } from "./fixtures/creator";
import { testChannel } from "./fixtures/video";
import { mockDiscordClient } from "./mock/discord";
import { TestTxManager } from "./mock/transaction";

let container: StartedPostgreSqlContainer;

export const setupTxManager = async () => {
  vi.mock("@discordeno/rest", () => ({
    createRestManager: vi.fn().mockImplementation(() => mockDiscordClient.rest),
  }));

  vi.mock("@discordeno/utils", () => ({
    getBotIdFromToken: vi.fn().mockImplementation(() => "mock_bot_id"),
  }));

  container = await new PostgreSqlContainer()
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const dbConfig = {
    connectionString: container.getConnectionUri(),
    isQueryLoggingEnabled: false,
  };

  const client = new Client({
    connectionString: dbConfig.connectionString,
  });
  await client.connect();

  const db = drizzle(client);
  await migrate(db, {
    migrationsFolder: path.join(
      __dirname,
      "../infra/repository/schema/migrations",
    ),
  });

  // Insert test data
  for (const creator of testCreators) {
    await db.insert(creatorTable).values(creator);
  }
  await db.insert(channelTable).values({
    id: testChannel.id,
    platformChannelId: testChannel.youtube?.rawId ?? "",
    creatorId: testChannel.creatorID,
    platformType: "youtube",
    title: testChannel.youtube?.name ?? "",
    description: testChannel.youtube?.description ?? "",
    publishedAt: new Date(testChannel.youtube?.publishedAt ?? new Date()),
    subscriberCount: testChannel.youtube?.subscriberCount ?? 0,
    thumbnailUrl: testChannel.youtube?.thumbnailURL ?? "",
  });

  const env = zAppWorkerEnv.parse(process.env);

  // Mock services
  const youtubeService = {
    youtube: null,
    chunkArray: () => [],
    getChannels: async () => Ok([testChannel]),
    getVideos: async () => Ok([]),
    searchVideos: async () => Ok([]),
  };

  const twitchService = {
    baseUrl: "",
    accessToken: "",
    config: { clientId: "", clientSecret: "" },
    getAccessToken: async () => "",
    fetchFromTwitch: async () => ({}),
    getChannels: async () => Ok([]),
    getVideos: async () => Ok([]),
    searchVideos: async () => Ok([]),
    getStreams: async () => Ok([]),
    getVideosByIDs: async () => Ok([]),
    getArchive: async () => Ok([]),
  };

  const twitcastingService = {
    accessToken: "",
    fetchUserVideos: async () => ({}),
    mapToTwitCastingVideo: async () => ({}),
    createVideoModel: async () => ({}),
    getChannels: async () => Ok([]),
    getVideos: async () => Ok([]),
    searchVideos: async () => Ok([]),
    getArchive: async () => Ok([]),
  };

  afterEach(async () => {
    await container.stop();
  });

  return new AppContext(
    new TestTxManager(dbConfig),
    youtubeService,
    twitchService,
    twitcastingService,
    new AIService({
      apiKey: env.OPENAI_API_KEY,
      organization: env.OPENAI_ORGANIZATION,
      project: env.OPENAI_PROJECT,
      baseURL: env.OPENAI_BASE_URL,
    }),
    new DiscordClient(env),
  );
};
