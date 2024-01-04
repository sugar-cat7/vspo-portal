package handler

import (
	oas "github.com/sugar-cat7/vspo-portal/generated"
)

// Compile-time check for Handler.
var _ oas.Handler = (*Handler)(nil)

type Handler struct {
	oas.UnimplementedHandler // automatically implement all methods
}

// NewHandler returns a new Handler.
func NewHandler() *Handler {
	return &Handler{}
}
