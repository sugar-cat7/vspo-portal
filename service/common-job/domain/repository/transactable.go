package repository

import "context"

type Transactable interface {
	// RWTx executes the provided function within a transaction and returns the function's result of type T and an error.
	RWTx(ctx context.Context, fn func(ctx context.Context) error) error
}
