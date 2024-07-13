package uuid

import (
	"github.com/google/uuid"
)

var UUID = func() string {
	uuid, _ := uuid.NewRandom()
	return uuid.String()
}

func MockUUID() string {
	mockUUID := "mock"
	UUID = func() string {
		return mockUUID
	}
	return mockUUID
}
