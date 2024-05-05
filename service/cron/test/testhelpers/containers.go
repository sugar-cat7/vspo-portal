package testhelpers

import (
	"context"
	"time"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/environment"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

type PostgresContainer struct {
	*postgres.PostgresContainer
}

func SetupPostgresContainer(ctx context.Context) (*PostgresContainer, error) {
	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:latest"),
		// postgres.WithInitScripts(filepath.Join("..", "testdata", "init-db.sql")),
		postgres.WithDatabase("vspo"),
		postgres.WithUsername("user"),
		postgres.WithPassword("password"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).WithStartupTimeout(5*time.Second)),
	)
	if err != nil {
		return nil, err
	}

	return &PostgresContainer{
		PostgresContainer: pgContainer,
	}, nil
}

type setupTx struct {
	Transactable repository.Transactable
}

func SetupTx(ctx context.Context) setupTx {
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}
	dbClient := database.NewClientPool(ctx,
		e.DatabaseEnvironment.DBHost,
		e.DatabaseEnvironment.DBUser,
		e.DatabaseEnvironment.DBPassword,
		e.DatabaseEnvironment.DBDatabase,
		e.DatabaseEnvironment.DBSSLMode,
	)
	tx := NewTestTransactable(
		dbClient,
	)

	return setupTx{
		Transactable: tx,
	}
}

func runTx(ctx context.Context, client *database.Client, fn func(context.Context) error) error {
	tx, err := client.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	txCtx := context.WithValue(ctx, database.ClientKey{}, &database.Client{Queries: client.Queries.WithTx(tx)})
	err = fn(txCtx)
	if err != nil {
		return err
	}
	if err := tx.Rollback(ctx); err != nil {
		return err
	}

	return nil
}

type testTransactable struct {
	dbClient database.Client
}

// NewTestTransactable creates a new Transactable instance.
func NewTestTransactable(
	dbClient database.Client,
) repository.Transactable {
	return &testTransactable{
		dbClient: dbClient,
	}
}

func (r *testTransactable) RWTx(ctx context.Context, fn func(ctx context.Context) error) error {
	return runTx(ctx, &r.dbClient, fn)
}
