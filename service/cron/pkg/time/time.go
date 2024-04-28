package utime

import (
	"time"

	"github.com/Code-Hex/synchro"
	"github.com/Code-Hex/synchro/tz"
	"github.com/jackc/pgx/v5/pgtype"
)

// UtcTime is a type for time in UTC.
type UtcTime time.Time

// Utc is a UtcTime instance.
var Utc = UtcTime{}

// Now returns the current time in UTC.
func (t UtcTime) Now() time.Time {
	utcNow := synchro.Now[tz.UTC]()
	return utcNow.StdTime()
}

// UnixToTime converts Unix time to time.Time.
func (t UtcTime) UnixToTime(sec int64, nsec int64) time.Time {
	utcTime := synchro.Unix[tz.UTC](sec, nsec)
	return utcTime.StdTime()
}

// ISOStringToTime converts ISO8601 string to time.Time.
func (t UtcTime) ISOStringToTime(iso8601 string) (time.Time, error) {
	utcTime, err := synchro.ParseISO[tz.UTC](iso8601)
	return utcTime.StdTime(), err
}

// TimestamptzToTime converts pgtype.Timestamptz to time.Time.
func TimestamptzToTime(t pgtype.Timestamptz) time.Time {
	return t.Time
}

// TimeToTimestamptz converts time.Time to pgtype.Timestamptz.
func TimeToTimestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: true}
}
