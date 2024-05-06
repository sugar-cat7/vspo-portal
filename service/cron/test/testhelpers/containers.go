package testhelpers

import (
	"context"
	"fmt"
	"time"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/cron/infra/database"
	repo "github.com/sugar-cat7/vspo-portal/service/cron/infra/database/repository"
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
	CreatorRepo  repository.Creator
	VideoRepo    repository.Video
}

func SetupRepo(ctx context.Context) setupTx {
	e := &environment.Environment{}
	if err := env.Parse(e); err != nil {
		panic(err)
	}
	c, err := SetupPostgresContainer(ctx)
	if err != nil {
		panic(err)
	}
	port, err := c.MappedPort(ctx, "5432")
	if err != nil {
		panic(err)
	}
	host, err := c.Host(ctx)
	if err != nil {
		panic(err)
	}

	RunUp(
		fmt.Sprintf("%s:%s", host, port.Port()),
		e.DatabaseEnvironment.DBUser,
		e.DatabaseEnvironment.DBPassword,
		e.DatabaseEnvironment.DBDatabase,
		e.DatabaseEnvironment.DBSSLMode,
	)

	dbClient := database.NewClientPool(ctx,
		fmt.Sprintf("%s:%s", host, port.Port()),
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
		CreatorRepo:  repo.NewCreator(),
		VideoRepo:    repo.NewVideo(),
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
