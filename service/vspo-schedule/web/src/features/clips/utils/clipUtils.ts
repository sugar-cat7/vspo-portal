import { getCurrentUTCDate } from "@vspo-lab/dayjs";
import { Clip, Pagination, ClipFilter } from "../domain/clip";
import { paginationSchema } from "../domain/clip";

/**
 * Calculate the start date for a timeframe filter
 */
export const getTimeframeStartDate = (
  timeframe: ClipFilter["timeframe"],
): Date | null => {
  if (timeframe === "all") return null;

  const now = getCurrentUTCDate();
  const startDate = getCurrentUTCDate();

  switch (timeframe) {
    case "1day":
      startDate.setDate(now.getDate() - 1);
      return startDate;
    case "1week":
      startDate.setDate(now.getDate() - 7);
      return startDate;
    case "1month":
      startDate.setMonth(now.getMonth() - 1);
      return startDate;
    default:
      return null;
  }
};

/**
 * Paginate clips
 */
export const paginateClips = (
  clips: Clip[],
  page: number,
  itemsPerPage: number,
): {
  clips: Clip[];
  pagination: Pagination;
} => {
  const totalItems = clips.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClips = clips.slice(startIndex, startIndex + itemsPerPage);

  // Validate pagination information
  const pagination = paginationSchema.parse({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
  });

  return {
    clips: paginatedClips,
    pagination,
  };
};
