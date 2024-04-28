// Code generated by ogen, DO NOT EDIT.

package api

import (
	"context"
	"net/http"
	"time"

	"github.com/go-faster/errors"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.19.0"
	"go.opentelemetry.io/otel/trace"

	ht "github.com/ogen-go/ogen/http"
	"github.com/ogen-go/ogen/middleware"
	"github.com/ogen-go/ogen/ogenerrors"
)

// handleCronCreatorsPostRequest handles POST /cron/creators operation.
//
// Creates creators by fetching from Youtube using provided Channel IDs.
//
// POST /cron/creators
func (s *Server) handleCronCreatorsPostRequest(args [0]string, argsEscaped bool, w http.ResponseWriter, r *http.Request) {
	otelAttrs := []attribute.KeyValue{
		semconv.HTTPMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/cron/creators"),
	}

	// Start a span for this request.
	ctx, span := s.cfg.Tracer.Start(r.Context(), "CronCreatorsPost",
		trace.WithAttributes(otelAttrs...),
		serverSpanKind,
	)
	defer span.End()

	// Add Labeler to context.
	labeler := &Labeler{attrs: otelAttrs}
	ctx = contextWithLabeler(ctx, labeler)

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		elapsedDuration := time.Since(startTime)
		attrOpt := metric.WithAttributeSet(labeler.AttributeSet())

		// Increment request counter.
		s.requests.Add(ctx, 1, attrOpt)

		// Use floating point division here for higher precision (instead of Millisecond method).
		s.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), attrOpt)
	}()

	var (
		recordError = func(stage string, err error) {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			s.errors.Add(ctx, 1, metric.WithAttributeSet(labeler.AttributeSet()))
		}
		err          error
		opErrContext = ogenerrors.OperationContext{
			Name: "CronCreatorsPost",
			ID:   "",
		}
	)
	{
		type bitset = [1]uint8
		var satisfied bitset
		{
			sctx, ok, err := s.securityApiKeyAuth(ctx, "CronCreatorsPost", r)
			if err != nil {
				err = &ogenerrors.SecurityError{
					OperationContext: opErrContext,
					Security:         "ApiKeyAuth",
					Err:              err,
				}
				defer recordError("Security:ApiKeyAuth", err)
				s.cfg.ErrorHandler(ctx, w, r, err)
				return
			}
			if ok {
				satisfied[0] |= 1 << 0
				ctx = sctx
			}
		}
		{
			sctx, ok, err := s.securityYoutubeApiKey(ctx, "CronCreatorsPost", r)
			if err != nil {
				err = &ogenerrors.SecurityError{
					OperationContext: opErrContext,
					Security:         "YoutubeApiKey",
					Err:              err,
				}
				defer recordError("Security:YoutubeApiKey", err)
				s.cfg.ErrorHandler(ctx, w, r, err)
				return
			}
			if ok {
				satisfied[0] |= 1 << 1
				ctx = sctx
			}
		}

		if ok := func() bool {
		nextRequirement:
			for _, requirement := range []bitset{
				{0b00000001},
				{0b00000010},
			} {
				for i, mask := range requirement {
					if satisfied[i]&mask != mask {
						continue nextRequirement
					}
				}
				return true
			}
			return false
		}(); !ok {
			err = &ogenerrors.SecurityError{
				OperationContext: opErrContext,
				Err:              ogenerrors.ErrSecurityRequirementIsNotSatisfied,
			}
			defer recordError("Security", err)
			s.cfg.ErrorHandler(ctx, w, r, err)
			return
		}
	}
	request, close, err := s.decodeCronCreatorsPostRequest(r)
	if err != nil {
		err = &ogenerrors.DecodeRequestError{
			OperationContext: opErrContext,
			Err:              err,
		}
		defer recordError("DecodeRequest", err)
		s.cfg.ErrorHandler(ctx, w, r, err)
		return
	}
	defer func() {
		if err := close(); err != nil {
			recordError("CloseRequest", err)
		}
	}()

	var response CronCreatorsPostRes
	if m := s.cfg.Middleware; m != nil {
		mreq := middleware.Request{
			Context:          ctx,
			OperationName:    "CronCreatorsPost",
			OperationSummary: "Upsert Channel(Youtube/Twitch/Twitcasting)",
			OperationID:      "",
			Body:             request,
			Params:           middleware.Parameters{},
			Raw:              r,
		}

		type (
			Request  = *CronCreatorsPostReq
			Params   = struct{}
			Response = CronCreatorsPostRes
		)
		response, err = middleware.HookMiddleware[
			Request,
			Params,
			Response,
		](
			m,
			mreq,
			nil,
			func(ctx context.Context, request Request, params Params) (response Response, err error) {
				response, err = s.h.CronCreatorsPost(ctx, request)
				return response, err
			},
		)
	} else {
		response, err = s.h.CronCreatorsPost(ctx, request)
	}
	if err != nil {
		defer recordError("Internal", err)
		s.cfg.ErrorHandler(ctx, w, r, err)
		return
	}

	if err := encodeCronCreatorsPostResponse(response, w, span); err != nil {
		defer recordError("EncodeResponse", err)
		if !errors.Is(err, ht.ErrInternalServerErrorResponse) {
			s.cfg.ErrorHandler(ctx, w, r, err)
		}
		return
	}
}

// handleCronVideosPostRequest handles POST /cron/videos operation.
//
// Update videos related to a specific creator based on provided cronType.
//
// POST /cron/videos
func (s *Server) handleCronVideosPostRequest(args [0]string, argsEscaped bool, w http.ResponseWriter, r *http.Request) {
	otelAttrs := []attribute.KeyValue{
		semconv.HTTPMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/cron/videos"),
	}

	// Start a span for this request.
	ctx, span := s.cfg.Tracer.Start(r.Context(), "CronVideosPost",
		trace.WithAttributes(otelAttrs...),
		serverSpanKind,
	)
	defer span.End()

	// Add Labeler to context.
	labeler := &Labeler{attrs: otelAttrs}
	ctx = contextWithLabeler(ctx, labeler)

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		elapsedDuration := time.Since(startTime)
		attrOpt := metric.WithAttributeSet(labeler.AttributeSet())

		// Increment request counter.
		s.requests.Add(ctx, 1, attrOpt)

		// Use floating point division here for higher precision (instead of Millisecond method).
		s.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), attrOpt)
	}()

	var (
		recordError = func(stage string, err error) {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			s.errors.Add(ctx, 1, metric.WithAttributeSet(labeler.AttributeSet()))
		}
		err          error
		opErrContext = ogenerrors.OperationContext{
			Name: "CronVideosPost",
			ID:   "",
		}
	)
	{
		type bitset = [1]uint8
		var satisfied bitset
		{
			sctx, ok, err := s.securityApiKeyAuth(ctx, "CronVideosPost", r)
			if err != nil {
				err = &ogenerrors.SecurityError{
					OperationContext: opErrContext,
					Security:         "ApiKeyAuth",
					Err:              err,
				}
				defer recordError("Security:ApiKeyAuth", err)
				s.cfg.ErrorHandler(ctx, w, r, err)
				return
			}
			if ok {
				satisfied[0] |= 1 << 0
				ctx = sctx
			}
		}
		{
			sctx, ok, err := s.securityYoutubeApiKey(ctx, "CronVideosPost", r)
			if err != nil {
				err = &ogenerrors.SecurityError{
					OperationContext: opErrContext,
					Security:         "YoutubeApiKey",
					Err:              err,
				}
				defer recordError("Security:YoutubeApiKey", err)
				s.cfg.ErrorHandler(ctx, w, r, err)
				return
			}
			if ok {
				satisfied[0] |= 1 << 1
				ctx = sctx
			}
		}

		if ok := func() bool {
		nextRequirement:
			for _, requirement := range []bitset{
				{0b00000001},
				{0b00000010},
			} {
				for i, mask := range requirement {
					if satisfied[i]&mask != mask {
						continue nextRequirement
					}
				}
				return true
			}
			return false
		}(); !ok {
			err = &ogenerrors.SecurityError{
				OperationContext: opErrContext,
				Err:              ogenerrors.ErrSecurityRequirementIsNotSatisfied,
			}
			defer recordError("Security", err)
			s.cfg.ErrorHandler(ctx, w, r, err)
			return
		}
	}
	request, close, err := s.decodeCronVideosPostRequest(r)
	if err != nil {
		err = &ogenerrors.DecodeRequestError{
			OperationContext: opErrContext,
			Err:              err,
		}
		defer recordError("DecodeRequest", err)
		s.cfg.ErrorHandler(ctx, w, r, err)
		return
	}
	defer func() {
		if err := close(); err != nil {
			recordError("CloseRequest", err)
		}
	}()

	var response CronVideosPostRes
	if m := s.cfg.Middleware; m != nil {
		mreq := middleware.Request{
			Context:          ctx,
			OperationName:    "CronVideosPost",
			OperationSummary: "Upsert videos",
			OperationID:      "",
			Body:             request,
			Params:           middleware.Parameters{},
			Raw:              r,
		}

		type (
			Request  = *CronVideosPostReq
			Params   = struct{}
			Response = CronVideosPostRes
		)
		response, err = middleware.HookMiddleware[
			Request,
			Params,
			Response,
		](
			m,
			mreq,
			nil,
			func(ctx context.Context, request Request, params Params) (response Response, err error) {
				response, err = s.h.CronVideosPost(ctx, request)
				return response, err
			},
		)
	} else {
		response, err = s.h.CronVideosPost(ctx, request)
	}
	if err != nil {
		defer recordError("Internal", err)
		s.cfg.ErrorHandler(ctx, w, r, err)
		return
	}

	if err := encodeCronVideosPostResponse(response, w, span); err != nil {
		defer recordError("EncodeResponse", err)
		if !errors.Is(err, ht.ErrInternalServerErrorResponse) {
			s.cfg.ErrorHandler(ctx, w, r, err)
		}
		return
	}
}
