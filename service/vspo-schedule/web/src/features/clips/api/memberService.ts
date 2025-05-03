import { VSPOApi, ListCreators200CreatorsItem } from "@vspo-lab/api";
import { Result, Ok, Err, BaseError } from "@vspo-lab/error";
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
export const fetchVspoMembers = async (): Promise<FetchVspoMembersResult> => {
  // Initialize API client
  const client = new VSPOApi({
    apiKey: process.env.API_KEY,
    baseUrl: process.env.API_URL,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
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
