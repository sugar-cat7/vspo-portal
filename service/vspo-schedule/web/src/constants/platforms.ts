import { Platform } from "@/types/streaming";

export const platforms: { id: Platform; name: string }[] = [
  { id: Platform.YouTube, name: "YouTube" },
  { id: Platform.Twitch, name: "Twitch" },
  { id: Platform.TwitCasting, name: "ツイキャス" },
  { id: Platform.NicoNico, name: "ニコニコ動画" },
];
