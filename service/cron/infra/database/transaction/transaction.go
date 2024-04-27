package transaction

import (
	"context"
	"fmt"

	"github.com/sugar-cat7/vspo-portal/service/common-api/infra/database"
)

// ClientKey is the key for the database connection used within the context.
type clientKey struct{}

// FromContext retrieves the database client from the context.
func FromContext(ctx context.Context) (*database.Client, error) {
	client, ok := ctx.Value(clientKey{}).(*database.Client)
	if !ok {
		return nil, fmt.Errorf("database client not found in context")
	}
	return client, nil
}

var RunTx = func(
	ctx context.Context,
	fn func(context.Context) error,
) error {
	db, err := FromContext(ctx)
	if err != nil {
		return err
	}
	return runTx(ctx, db, fn)
}

func runTx(
	ctx context.Context,
	db *database.Client,
	fn func(context.Context) error,
) error {
	db.Queries.WithTx()
	return nil
}
