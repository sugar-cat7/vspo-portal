import { Livestream } from "@/features/schedule/domain";
import { utcToZonedTime } from "date-fns-tz";

// Time blocks for grouping livestreams
const TIME_BLOCKS = [
  { start: 0, end: 6, label: "00:00 - 06:00" },
  { start: 6, end: 12, label: "06:00 - 12:00" },
  { start: 12, end: 18, label: "12:00 - 18:00" },
  { start: 18, end: 24, label: "18:00 - 00:00" },
];

// Group livestreams by date and time block
export const groupLivestreamsByTimeBlock = (
  livestreamsByDate: Record<string, Livestream[]>,
  timeZone: string,
): Record<string, Record<string, Livestream[]>> => {
  const result: Record<string, Record<string, Livestream[]>> = {};

  Object.entries(livestreamsByDate).forEach(([date, livestreams]) => {
    result[date] = {};

    // Initialize all time blocks
    TIME_BLOCKS.forEach((block) => {
      result[date][block.label] = [];
    });

    // Sort livestreams into time blocks using the user's timezone
    livestreams.forEach((livestream) => {
      // Convert UTC time to user's timezone
      const startTimeInUserTZ = utcToZonedTime(
        livestream.scheduledStartTime,
        timeZone,
      );
      const hours = startTimeInUserTZ.getHours();

      for (const block of TIME_BLOCKS) {
        if (hours >= block.start && hours < block.end) {
          result[date][block.label].push(livestream);
          break;
        }
      }
    });

    // Remove empty time blocks
    Object.keys(result[date]).forEach((blockLabel) => {
      if (result[date][blockLabel].length === 0) {
        delete result[date][blockLabel];
      }
    });

    // Remove dates with no livestreams in any time block
    if (Object.keys(result[date]).length === 0) {
      delete result[date];
    }
  });

  return result;
};
