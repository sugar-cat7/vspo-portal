package transaction

import (
	"context"
	"fmt"

	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
)

// FromContext extracts the database client from the context.
func FromContext(ctx context.Context) (*database.Client, error) {
	client, ok := ctx.Value(database.ClientKey{}).(*database.Client)
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
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback(ctx)
			panic(p) // Re-throw panic after Rollback
		} else if err != nil {
			_ = tx.Rollback(ctx) // err is non-nil; don't change it
		} else {
			err = tx.Commit(ctx) // if Commit returns error update err
		}
	}()

	txCtx := context.WithValue(ctx, database.ClientKey{}, &database.Client{Queries: client.Queries.WithTx(tx)})
	err = fn(txCtx)
	if err != nil {
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

type transactable struct {
	dnClient database.Client
}

// NewTransactable creates a new Transactable instance.
func NewTransactable(
	dbClient database.Client,
) repository.Transactable {
	return &transactable{
		dnClient: dbClient,
	}
}

func (r *transactable) RWTx(ctx context.Context, fn func(ctx context.Context) error) error {
	return runTx(ctx, &r.dnClient, fn)
}
