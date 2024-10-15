package logger

import (
	"context"
	"os"

	"log/slog"
)

func New() *slog.Logger {
	opts := &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}

	handler := slog.NewJSONHandler(os.Stdout, opts)
	logger := slog.New(handler)

	slog.SetDefault(logger)

	return logger
}

// LoggerKey is a custom type to avoid key collisions in context.
type LoggerKey struct{}

// GetLogger gets the logger from the context.
func GetLogger(ctx context.Context) *slog.Logger {
	logger, ok := ctx.Value(LoggerKey{}).(*slog.Logger)
	if !ok {
		return New()
	}
	return logger
}
