package testhelpers

import (
	"context"
	"fmt"
	"time"

	"github.com/caarlos0/env/v10"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	repo "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/repository"
	migration "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/schema"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/environment"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

type PostgresContainer struct {
	*postgres.PostgresContainer
}

func SetupPostgresContainer(ctx context.Context) (*PostgresContainer, error) {
	pgContainer, err := postgres.Run(ctx,
		"postgres:latest",
		postgres.WithDatabase("test_vspo"),
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
	ChannelRepo  repository.Channel
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

	dbName := "test_vspo"
	dbUser := "user"
	dbPassword := "password"
	dbSSLMode := "disable"

	migration.RunUp(
		fmt.Sprintf("%s:%s", host, port.Port()),
		dbUser,
		dbPassword,
		dbName,
		dbSSLMode,
	)

	dbClient := database.NewClientPool(ctx,
		fmt.Sprintf("%s:%s", host, port.Port()),
		dbUser,
		dbPassword,
		dbName,
		dbSSLMode,
	)

	tx := NewTestTransactable(
		dbClient,
	)
	return setupTx{
		Transactable: tx,
		CreatorRepo:  repo.NewCreator(),
		VideoRepo:    repo.NewVideo(),
		ChannelRepo:  repo.NewChannel(),
	}
}

// RollbackKey is used to store rollback flag in context
type rollbackKey struct{}

// WithRollbackFlag adds the rollback flag to the context
func WithRollbackFlag(ctx context.Context, rollback bool) context.Context {
	return context.WithValue(ctx, rollbackKey{}, rollback)
}

// ShouldRollback checks if the context contains a rollback flag
func ShouldRollback(ctx context.Context) bool {
	if rollback, ok := ctx.Value(rollbackKey{}).(bool); ok {
		return rollback
	}
	return true
}

func CreateMockData(ctx context.Context, tx repository.Transactable, videos model.Videos) error {
	ctx = WithRollbackFlag(ctx, false)

	return tx.RWTx(ctx, func(ctx context.Context) error {
		v := repo.NewVideo()

		_, err := v.BatchDeleteInsert(ctx, videos)
		if err != nil {
			return err
		}
		return nil
	})
}

func runTx(ctx context.Context, client *database.Client, fn func(context.Context) error) error {
	tx, err := client.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	txCtx := context.WithValue(ctx, database.ClientKey{}, &database.Client{Queries: client.Queries.WithTx(tx)})
	err = fn(txCtx)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("transaction rollback failed: %v, original error: %v", rbErr, err)
		}
		return err
	}

	if ShouldRollback(ctx) {
		if err := tx.Rollback(ctx); err != nil {
			return err
		}
	} else {
		fmt.Println("commit")
		if err := tx.Commit(ctx); err != nil {
			return err
		}
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
