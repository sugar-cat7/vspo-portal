// Code generated by MockGen. DO NOT EDIT.
// Source: creator.go
//
// Generated by this command:
//
//	mockgen -source=creator.go -destination=mock/creator.go -package=mock_repository
//

// Package mock_repository is a generated GoMock package.
package mock_repository

import (
	context "context"
	reflect "reflect"

	model "github.com/sugar-cat7/vspo-portal/service/cron/domain/model"
	repository "github.com/sugar-cat7/vspo-portal/service/cron/domain/repository"
	gomock "go.uber.org/mock/gomock"
)

// MockCreator is a mock of Creator interface.
type MockCreator struct {
	ctrl     *gomock.Controller
	recorder *MockCreatorMockRecorder
}

// MockCreatorMockRecorder is the mock recorder for MockCreator.
type MockCreatorMockRecorder struct {
	mock *MockCreator
}

// NewMockCreator creates a new mock instance.
func NewMockCreator(ctrl *gomock.Controller) *MockCreator {
	mock := &MockCreator{ctrl: ctrl}
	mock.recorder = &MockCreatorMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockCreator) EXPECT() *MockCreatorMockRecorder {
	return m.recorder
}

// Count mocks base method.
func (m *MockCreator) Count(ctx context.Context, query repository.ListCreatorsQuery) (uint64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Count", ctx, query)
	ret0, _ := ret[0].(uint64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Count indicates an expected call of Count.
func (mr *MockCreatorMockRecorder) Count(ctx, query any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Count", reflect.TypeOf((*MockCreator)(nil).Count), ctx, query)
}

// List mocks base method.
func (m *MockCreator) List(ctx context.Context, query repository.ListCreatorsQuery) (model.Creators, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "List", ctx, query)
	ret0, _ := ret[0].(model.Creators)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// List indicates an expected call of List.
func (mr *MockCreatorMockRecorder) List(ctx, query any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "List", reflect.TypeOf((*MockCreator)(nil).List), ctx, query)
}

// Upsert mocks base method.
func (m_2 *MockCreator) Upsert(ctx context.Context, m model.Creators) (model.Creators, error) {
	m_2.ctrl.T.Helper()
	ret := m_2.ctrl.Call(m_2, "Upsert", ctx, m)
	ret0, _ := ret[0].(model.Creators)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Upsert indicates an expected call of Upsert.
func (mr *MockCreatorMockRecorder) Upsert(ctx, m any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Upsert", reflect.TypeOf((*MockCreator)(nil).Upsert), ctx, m)
}