package database

import (
	"context"
	"fmt"
	"os"

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
func NewClientPool(ctx context.Context, host, user, password, dbname, sslMode string) Client {
	// Connection string with max pool connections
	connString := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s&pool_max_conns=10", user, password, host, dbname, sslMode)
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		fmt.Println("Failed to parse pool config:", err)
		os.Exit(1)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		fmt.Println("Failed to create pool:", err)
		os.Exit(1)
	}

	// Perform a ping to check database connectivity
	if err := pool.Ping(ctx); err != nil {
		fmt.Println("Failed to ping database:", err)
		pool.Close() // Make sure to close the pool if ping fails
		os.Exit(1)
	}

	client := Client{
		Queries: db_sqlc.New(pool),
		Pool:    pool,
	}

	// Use a goroutine to close the connection pool when the context ends
	go func() {
		<-ctx.Done()
		pool.Close()
	}()

	return client
}

// FromContext retrieves the database client from the context.
func FromContext(ctx context.Context) (*Client, error) {
	client, ok := ctx.Value(ClientKey{}).(*Client)
	if !ok {
		return nil, fmt.Errorf("database client not found in context")
	}
	return client, nil
}
