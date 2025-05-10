import { DEFAULT_LOCALE } from "@/lib/Const";
import { getCurrentUTCDate } from "@/lib/dayjs";
import {
  getInitializedI18nInstance,
  getSessionId,
  matchesDateFormat,
} from "@/lib/utils";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchEvents } from "../../api";
import { MonthEventsProps } from "./container";

type Params = {
  /**
   * Date in format YYYY-MM
   */
  yearMonth: string;
};

export const getServerSideProps: GetServerSideProps<
  MonthEventsProps,
  Params
> = async ({ params, locale = DEFAULT_LOCALE, req }) => {
  const yearMonth = params?.yearMonth;
  const isValidYearMonth =
    yearMonth !== undefined && matchesDateFormat(yearMonth, "yyyy-MM");
  if (!isValidYearMonth) {
    console.error("Invalid yearMonth format:", yearMonth);
    return {
      notFound: true,
    };
  }

  try {
    const eventsResult = await fetchEvents({
      startedDateFrom: `${yearMonth}-01`,
      startedDateTo: `${yearMonth}-31`,
      sessionId: getSessionId(req),
    });

    if (eventsResult.err) {
      console.error("Error fetching events:", eventsResult.err, {
        yearMonth,
        startedDateFrom: `${yearMonth}-01`,
        startedDateTo: `${yearMonth}-31`,
      });
      return {
        notFound: true,
      };
    }

    const fetchedEvents = eventsResult.val.events;
    if (fetchedEvents.length === 0) {
      console.error("No events found for period:", {
        yearMonth,
        startedDateFrom: `${yearMonth}-01`,
        startedDateTo: `${yearMonth}-31`,
      });
      return {
        notFound: true,
      };
    }

    const translations = await serverSideTranslations(locale, [
      "common",
      "events",
    ]);
    const { t } = getInitializedI18nInstance(translations);

    return {
      props: {
        ...translations,
        events: fetchedEvents,
        yearMonth,
        lastUpdateTimestamp: getCurrentUTCDate().getTime(),
        meta: {
          title: t("title", { ns: "events" }),
          description: t("description", { ns: "events" }),
        },
      },
    };
  } catch (error) {
    console.error("Unexpected error in getServerSideProps:", error);
    return {
      notFound: true,
    };
  }
};
