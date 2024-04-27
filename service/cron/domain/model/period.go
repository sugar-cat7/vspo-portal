package model

import (
	"fmt"
	"time"

	utime "github.com/sugar-cat7/vspo-portal/service/cron/pkg/time"
)

type Period string

const (
	PeriodAll   Period = "all"
	PeriodDay   Period = "day"
	PeriodMonth Period = "month"
	PeriodWeek  Period = "week"
)

func (p Period) String() string {
	return string(p)
}

// NewPeriod returns the start and end time of the period.
func NewPeriod(period string) (startedAt, endedAt time.Time, err error) {
	switch Period(period) {
	case PeriodDay:
		endedAt = utime.Utc.Now()
		startedAt = endedAt.AddDate(0, 0, -1)
	case PeriodWeek:
		endedAt = utime.Utc.Now()
		startedAt = endedAt.AddDate(0, 0, -7)
	case PeriodMonth:
		endedAt = utime.Utc.Now()
		startedAt = endedAt.AddDate(0, -1, 0)
	case PeriodAll:
		// NOTE: Temporarily fetch data up to one year back
		endedAt = utime.Utc.Now()
		startedAt = endedAt.AddDate(-1, 0, 0)
	default:
		return time.Time{}, time.Time{}, fmt.Errorf("invalid period: %s", period)
	}
	return startedAt, endedAt, nil
}
