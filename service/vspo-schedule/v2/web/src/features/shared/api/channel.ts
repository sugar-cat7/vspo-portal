import { getCloudflareEnvironmentContext } from "@/lib/cloudflare/context";
import { ListCreators200CreatorsItem, VSPOApi } from "@vspo-lab/api";
import { AppError, BaseError, Result, wrap } from "@vspo-lab/error";
import { Channel } from "../domain/channel";

export type FetchVspoMembersResult = Result<
  {
    members: Channel[];
  },
  BaseError
>;

/**
 * Worker response type for creator data
 */
type WorkerCreatorResponse = {
  id: string;
  name?: string;
  thumbnailURL?: string;
  memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general" | "vspo_all";
  channel?: {
    youtube?: {
      name: string;
    } | null;
  } | null;
};

/**
 * Fetch VSPO member information
 */
export const fetchVspoMembers = async ({
  sessionId,
}: {
  sessionId?: string;
}): Promise<FetchVspoMembersResult> => {
  const getVspoMembersData = async (): Promise<{ members: Channel[] }> => {
    const { cfEnv } = await getCloudflareEnvironmentContext();

    const members: Channel[] = [];

    if (cfEnv) {
      const { APP_WORKER } = cfEnv;

      // Fetch Japanese and English members in parallel using APP_WORKER
      const [vspoJpResult, vspoEnResult] = await Promise.all([
        APP_WORKER.newCreatorUsecase().list({
          limit: 100,
          page: 0,
          memberType: "vspo_jp",
        }),
        APP_WORKER.newCreatorUsecase().list({
          limit: 100,
          page: 0,
          memberType: "vspo_en",
        }),
      ]);

      if (vspoJpResult.err) {
        throw vspoJpResult.err;
      }

      if (vspoEnResult.err) {
        throw vspoEnResult.err;
      }

      // Add Japanese members
      if (vspoJpResult.val?.creators) {
        vspoJpResult.val.creators.forEach((creator) => {
          members.push(mapWorkerResponseToChannel(creator));
        });
      }

      // Add English members
      if (vspoEnResult.val?.creators) {
        vspoEnResult.val.creators.forEach((creator) => {
          members.push(mapWorkerResponseToChannel(creator));
        });
      }
    } else {
      // Use regular VSPO API
      const client = new VSPOApi({
        baseUrl: process.env.API_URL_V2 || "",
        sessionId: sessionId,
      });

      // Fetch Japanese and English members in parallel
      const [vspoJpResponse, vspoEnResponse] = await Promise.all([
        client.creators.list({
          limit: "100",
          page: "0",
          memberType: "vspo_jp",
        }),
        client.creators.list({
          limit: "100",
          page: "0",
          memberType: "vspo_en",
        }),
      ]);

      if (vspoJpResponse.err) {
        throw vspoJpResponse.err;
      }

      if (vspoEnResponse.err) {
        throw vspoEnResponse.err;
      }

      // Add Japanese members
      vspoJpResponse.val.creators.forEach((creator) => {
        members.push(mapToChannel(creator));
      });

      // Add English members
      vspoEnResponse.val.creators.forEach((creator) => {
        members.push(mapToChannel(creator));
      });
    }

    return { members };
  };

  return wrap(
    getVspoMembersData(),
    (error) =>
      new AppError({
        message: "Failed to fetch VSPO members",
        code: "INTERNAL_SERVER_ERROR",
        cause: error,
        context: { sessionId },
      }),
  );
};

/**
 * Convert API response to Channel type
 */
const mapToChannel = (creator: ListCreators200CreatorsItem): Channel => {
  return {
    id: creator.id,
    name: creator.name,
    thumbnailURL: creator.thumbnailURL, // Match API response property name
    active: true, // Treat all as active for now
    memberType: creator.memberType,
  };
};

/**
 * Convert APP_WORKER response to Channel type
 */
const mapWorkerResponseToChannel = (
  creator: WorkerCreatorResponse,
): Channel => {
  return {
    id: creator.id,
    name: creator.channel?.youtube?.name || creator.name || "",
    thumbnailURL: creator.thumbnailURL || "",
    active: true, // Treat all as active for now
    memberType: creator.memberType,
  };
};
