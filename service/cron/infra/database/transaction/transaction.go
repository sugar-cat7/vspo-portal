package transaction

import (
	"context"
	"fmt"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
)

// clientKey is a context key for storing the database client.
type clientKey struct{}

// FromContext extracts the database client from the context.
func FromContext(ctx context.Context) (*database.Client, error) {
	client, ok := ctx.Value(clientKey{}).(*database.Client)
	if !ok {
		return nil, fmt.Errorf("database client not found in context")
	}
	return client, nil
}

func runTx(ctx context.Context, client *database.Client, fn func(context.Context) error) error {
	tx, err := client.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	txCtx := context.WithValue(ctx, clientKey{}, &database.Client{Queries: client.Queries.WithTx(tx)})

	err = fn(txCtx)
	if err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

type transactable struct{}

// NewTransactable creates a new Transactable instance.
func NewTransactable() repository.Transactable {
	return &transactable{}
}

func (r *transactable) RWTx(ctx context.Context, fn func(ctx context.Context) error) error {
	client, err := FromContext(ctx)
	if err != nil {
		return err
	}
	return runTx(ctx, client, fn)
}
