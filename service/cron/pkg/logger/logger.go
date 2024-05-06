package logger

import (
	"github.com/blendle/zapdriver"
	"go.uber.org/zap"
)

func New() *zap.Logger {
	l, err := zapdriver.NewProduction()
	defer func() {
		if err := l.Sync(); err != nil {
			panic(err)
		}
	}()
	if err != nil {
		panic(err)
	}
	return l
}
