import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ListCreators200CreatorsItem, VSPOApi } from "@vspo-lab/api";
import { BaseError, Err, Ok, Result } from "@vspo-lab/error";
import { Channel } from "../domain/channel";

export type FetchVspoMembersResult = Result<
  {
    members: Channel[];
  },
  BaseError
>;

/**
 * Fetch VSPO member information
 */
export const fetchVspoMembers = async ({
  sessionId,
}: {
  sessionId?: string;
}): Promise<FetchVspoMembersResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: getCloudflareContext().env.API_KEY_V2,
    baseUrl: getCloudflareContext().env.API_URL_V2,
    cfAccessClientId: getCloudflareContext().env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: getCloudflareContext().env.CF_ACCESS_CLIENT_SECRET,
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
    return Err(vspoJpResponse.err);
  }

  if (vspoEnResponse.err) {
    return Err(vspoEnResponse.err);
  }

  // Integrate and format member information
  const members: Channel[] = [];

  // Add Japanese members
  vspoJpResponse.val.creators.forEach((creator) => {
    members.push(mapToChannel(creator));
  });

  // Add English members
  vspoEnResponse.val.creators.forEach((creator) => {
    members.push(mapToChannel(creator));
  });

  return Ok({
    members,
  });
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
