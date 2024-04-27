package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/internal/gen"
)

// ClientKey is the key for the database connection used within the context.
type ClientKey struct{}

// Client is the client for executing database queries.
type Client struct {
	Queries *db_sqlc.Queries
	Pool    *pgxpool.Pool
}

// NewClientPool creates a new database client with a connection pool and adds it to the context.
func NewClientPool(ctx context.Context, host, user, password, dbname, sslMode string) (*Client, context.Context) {
	connString := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s sslmode=%s",
		host,
		user,
		password,
		dbname,
		sslMode,
	)
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		panic(err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		panic(err)
	}

	client := &Client{
		Queries: db_sqlc.New(pool),
		Pool:    pool,
	}

	// Add the database client to the context.
	ctx = context.WithValue(ctx, ClientKey{}, client)

	// Use a goroutine to close the connection pool when the context ends.
	go func() {
		<-ctx.Done()
		pool.Close()
	}()

	return client, ctx
}

// FromContext retrieves the database client from the context.
func FromContext(ctx context.Context) (*Client, error) {
	client, ok := ctx.Value(ClientKey{}).(*Client)
	if !ok {
		return nil, fmt.Errorf("database client not found in context")
	}
	return client, nil
}
