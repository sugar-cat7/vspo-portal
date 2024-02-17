package logger

import (
	"github.com/blendle/zapdriver"
	"go.uber.org/zap"
)

func NewLogger() *zap.Logger {
	l, err := zapdriver.NewProduction()
	defer l.Sync()
	if err != nil {
		panic(err)
	}
	return l
}

var DefaultLogger = NewLogger()
