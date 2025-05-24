import { z } from "zod";

// Zod schema definition for channel information
export const channelSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbnailURL: z.string(), // Match property name from API response
  active: z.boolean().default(true),
  memberType: z.string(),
});

// Generate type from Zod schema
export type Channel = z.infer<typeof channelSchema>;

// Parser function to create Channel object from API response
export const parseChannelFromResponse = (data: unknown): Channel => {
  return channelSchema.parse(data);
};

// Function to parse multiple channels
export const parseChannelsFromResponse = (data: unknown[]): Channel[] => {
  return z.array(channelSchema).parse(data);
};
