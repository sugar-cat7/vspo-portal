package repository

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/codes"

	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/model"
	"github.com/sugar-cat7/vspo-portal/service/common-job/domain/repository"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database"
	"github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/dto"
	db_sqlc "github.com/sugar-cat7/vspo-portal/service/common-job/infra/database/internal/gen"
	trace "github.com/sugar-cat7/vspo-portal/service/common-job/pkg/otel"
)

type creator struct{}

// NewCreator is ...
func NewCreator() repository.Creator {
	return &creator{}
}

var _ repository.Creator = (*creator)(nil)

func (r *creator) List(
	ctx context.Context,
	query repository.ListCreatorsQuery,
) (model.Creators, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Creator/List")
	defer span.End()

	client, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}
	// Execute the query to retrieve creators with channels.
	cs, err := client.Queries.GetCreatorsWithChannels(ctx, query.MemberTypes)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to fetch creators with channels")
		return nil, err
	}

	res := dto.CreatorsWithChannelsRowsToModel(cs)
	return res, nil
}

func (r *creator) Count(
	ctx context.Context,
	_ repository.ListCreatorsQuery,
) (uint64, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Creator/Count")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return 0, err
	}

	cn, err := c.Queries.CountCreator(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to count creators")
		return 0, err
	}
	return uint64(cn), nil
}

func (r *creator) BatchCreate(
	ctx context.Context,
	m model.Creators,
) (model.Creators, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Creator/BatchCreate")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return nil, err
	}

	br := c.Queries.CreateCreator(ctx, dto.CreatorModelsToCreateCreatorParams(m))
	defer br.Close()

	var i model.Creators
	var createErrors []error
	br.QueryRow(func(_ int, ch db_sqlc.Creator, err error) {
		if err != nil {
			createErrors = append(createErrors, err)
			return
		}
		i = append(i, dto.CreatorToModel(&ch))
	})

	if len(createErrors) > 0 {
		span.SetStatus(codes.Error, fmt.Sprintf("Failed to create creators: %v", createErrors))
		return nil, fmt.Errorf("failed to create creators: %v", createErrors)
	}

	return i, nil
}

func (r *creator) Exist(
	ctx context.Context,
	query repository.GetCreatorQuery,
) (bool, error) {
	tracer := trace.GetGlobalTracer()
	ctx, span := tracer.Start(ctx, "Repository#Creator/Exist")
	defer span.End()

	c, err := database.FromContext(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to get database connection")
		return false, err
	}

	b, err := c.Queries.ExistsCreator(ctx, query.ID)
	if err != nil {
		span.SetStatus(codes.Error, "Failed to check if creator exists")
		return false, err
	}

	return b, nil
}
