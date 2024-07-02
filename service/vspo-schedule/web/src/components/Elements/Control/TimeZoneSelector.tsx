import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";
import { Autocomplete, Box, MenuItem, TextField } from "@mui/material";
import { useTimeZoneContext } from "@/hooks";
import { formatDate } from "@/lib/utils";

export const TimeZoneSelector = () => {
  const { t } = useTranslation("common");
  const { timeZone, setTimeZone } = useTimeZoneContext();

  const timeZones = useMemo(() => Intl.supportedValuesOf("timeZone"), []);
  const labels = useMemo(() => {
    return timeZones.reduce<Record<string, React.ReactNode>>(
      (acc, timeZone) => {
        acc[timeZone] = getTimeZoneLabel(timeZone);
        return acc;
      },
      {},
    );
  }, []);
  const now = Date.now();
  const formattedTimeZoneOffsets = timeZones.reduce<Record<string, string>>(
    (acc, timeZone) => {
      acc[timeZone] = formatDate(now, "OOOO", { timeZone });
      return acc;
    },
    {},
  );

  return (
    <Autocomplete
      id="time-zone-select"
      autoHighlight
      componentsProps={{
        popper: {
          style: { width: "fit-content" },
        },
      }}
      renderInput={(params) => (
        <TextField {...params} size="small" label={t("drawer.timeZone")} />
      )}
      value={timeZone}
      onChange={(event, newValue) => {
        setTimeZone(newValue ?? timeZone);
      }}
      options={timeZones}
      filterOptions={(options, state) => {
        return options.filter((option) => {
          return normalizeTimeZone(option).includes(
            normalizeTimeZone(state.inputValue).replaceAll(" ", "_"),
          );
        });
      }}
      renderOption={(props, tz) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const { key, ...optionProps } = props;
        return (
          <MenuItem
            key={key}
            component="li"
            {...optionProps}
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
            }}
          >
            <Box sx={{ width: "200px" }}>{labels[tz]}</Box>
            <Box
              sx={(theme) => ({
                color: theme.vars.palette.text.secondary,
                fontFamily: "monospace",
                fontSize: "14px",
              })}
            >
              {formattedTimeZoneOffsets[tz]}
            </Box>
          </MenuItem>
        );
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      }}
    />
  );
};

const normalizeTimeZone = (s: string) => s.toLowerCase();

const getTimeZoneLabel = (timeZone: string) => (
  <>
    {timeZone.split("/").map((part, i) => (
      <React.Fragment key={i}>
        {i !== 0 && (
          <>
            <wbr />/
          </>
        )}
        {part}
      </React.Fragment>
    ))}
  </>
);
