package repository

import "context"

//go:generate go run go.uber.org/mock/mockgen -source=$GOFILE -destination=mock/$GOFILE -package=mock_repository
type Transactable interface {
	// RWTx executes the provided function within a transaction and returns the function's result of type T and an error.
	RWTx(ctx context.Context, fn func(ctx context.Context) error) error
}
