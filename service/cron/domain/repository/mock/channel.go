// Code generated by MockGen. DO NOT EDIT.
// Source: channel.go
//
// Generated by this command:
//
//	mockgen -source=channel.go -destination=mock/channel.go -package=mock_repository
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

// MockChannel is a mock of Channel interface.
type MockChannel struct {
	ctrl     *gomock.Controller
	recorder *MockChannelMockRecorder
}

// MockChannelMockRecorder is the mock recorder for MockChannel.
type MockChannelMockRecorder struct {
	mock *MockChannel
}

// NewMockChannel creates a new mock instance.
func NewMockChannel(ctrl *gomock.Controller) *MockChannel {
	mock := &MockChannel{ctrl: ctrl}
	mock.recorder = &MockChannelMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockChannel) EXPECT() *MockChannelMockRecorder {
	return m.recorder
}

// Count mocks base method.
func (m *MockChannel) Count(ctx context.Context, query repository.ListChannelsQuery) (uint64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Count", ctx, query)
	ret0, _ := ret[0].(uint64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Count indicates an expected call of Count.
func (mr *MockChannelMockRecorder) Count(ctx, query any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Count", reflect.TypeOf((*MockChannel)(nil).Count), ctx, query)
}

// List mocks base method.
func (m *MockChannel) List(ctx context.Context, query repository.ListChannelsQuery) (model.Channels, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "List", ctx, query)
	ret0, _ := ret[0].(model.Channels)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// List indicates an expected call of List.
func (mr *MockChannelMockRecorder) List(ctx, query any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "List", reflect.TypeOf((*MockChannel)(nil).List), ctx, query)
}

// Upsert mocks base method.
func (m_2 *MockChannel) Upsert(ctx context.Context, m model.Channels) (model.Channels, error) {
	m_2.ctrl.T.Helper()
	ret := m_2.ctrl.Call(m_2, "Upsert", ctx, m)
	ret0, _ := ret[0].(model.Channels)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Upsert indicates an expected call of Upsert.
func (mr *MockChannelMockRecorder) Upsert(ctx, m any) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Upsert", reflect.TypeOf((*MockChannel)(nil).Upsert), ctx, m)
}