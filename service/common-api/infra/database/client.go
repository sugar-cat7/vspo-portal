package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-api/infra/database/internal/db"
)

// ClientKey is the key for the database connection used within the context.
type ClientKey struct{}

// Client is the client for executing database queries.
type Client struct {
	Queries *db_sqlc.Queries
}

// NewClient creates a new database client and adds it to the context.
func NewClient(ctx context.Context, host, user, password, database, sslMode string) (*Client, context.Context) {
	connString := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s sslmode=%s",
		host,
		user,
		password,
		database,
		sslMode,
	)
	conn, err := pgx.Connect(ctx, connString)
	if err != nil {
		panic(err)
	}

	client := &Client{
		Queries: db_sqlc.New(conn),
	}

	// Add the database client to the context.
	ctx = context.WithValue(ctx, ClientKey{}, client)

	// Use a goroutine to close the connection when the context ends.
	go func() {
		<-ctx.Done()
		conn.Close(context.Background())
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
