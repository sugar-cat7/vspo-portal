// Code generated by ogen, DO NOT EDIT.

package api

import (
	"time"

	"github.com/go-faster/errors"
)

type ApiKeyAuth struct {
	APIKey string
}

// GetAPIKey returns the value of APIKey.
func (s *ApiKeyAuth) GetAPIKey() string {
	return s.APIKey
}

// SetAPIKey sets the value of APIKey.
func (s *ApiKeyAuth) SetAPIKey(val string) {
	s.APIKey = val
}

// Ref: #/components/schemas/ChannelResponse
type ChannelResponse struct {
	ID         OptString                    `json:"id"`
	Snippet    OptChannelSnippetResponse    `json:"snippet"`
	Statistics OptChannelStatisticsResponse `json:"statistics"`
	Videos     []VideoResponse              `json:"videos"`
}

// GetID returns the value of ID.
func (s *ChannelResponse) GetID() OptString {
	return s.ID
}

// GetSnippet returns the value of Snippet.
func (s *ChannelResponse) GetSnippet() OptChannelSnippetResponse {
	return s.Snippet
}

// GetStatistics returns the value of Statistics.
func (s *ChannelResponse) GetStatistics() OptChannelStatisticsResponse {
	return s.Statistics
}

// GetVideos returns the value of Videos.
func (s *ChannelResponse) GetVideos() []VideoResponse {
	return s.Videos
}

// SetID sets the value of ID.
func (s *ChannelResponse) SetID(val OptString) {
	s.ID = val
}

// SetSnippet sets the value of Snippet.
func (s *ChannelResponse) SetSnippet(val OptChannelSnippetResponse) {
	s.Snippet = val
}

// SetStatistics sets the value of Statistics.
func (s *ChannelResponse) SetStatistics(val OptChannelStatisticsResponse) {
	s.Statistics = val
}

// SetVideos sets the value of Videos.
func (s *ChannelResponse) SetVideos(val []VideoResponse) {
	s.Videos = val
}

// Ref: #/components/schemas/ChannelSnippetResponse
type ChannelSnippetResponse struct {
	Youtube     OptPlatformSnippet `json:"Youtube"`
	Twitch      OptPlatformSnippet `json:"Twitch"`
	TwitCasting OptPlatformSnippet `json:"TwitCasting"`
	Niconico    OptPlatformSnippet `json:"Niconico"`
}

// GetYoutube returns the value of Youtube.
func (s *ChannelSnippetResponse) GetYoutube() OptPlatformSnippet {
	return s.Youtube
}

// GetTwitch returns the value of Twitch.
func (s *ChannelSnippetResponse) GetTwitch() OptPlatformSnippet {
	return s.Twitch
}

// GetTwitCasting returns the value of TwitCasting.
func (s *ChannelSnippetResponse) GetTwitCasting() OptPlatformSnippet {
	return s.TwitCasting
}

// GetNiconico returns the value of Niconico.
func (s *ChannelSnippetResponse) GetNiconico() OptPlatformSnippet {
	return s.Niconico
}

// SetYoutube sets the value of Youtube.
func (s *ChannelSnippetResponse) SetYoutube(val OptPlatformSnippet) {
	s.Youtube = val
}

// SetTwitch sets the value of Twitch.
func (s *ChannelSnippetResponse) SetTwitch(val OptPlatformSnippet) {
	s.Twitch = val
}

// SetTwitCasting sets the value of TwitCasting.
func (s *ChannelSnippetResponse) SetTwitCasting(val OptPlatformSnippet) {
	s.TwitCasting = val
}

// SetNiconico sets the value of Niconico.
func (s *ChannelSnippetResponse) SetNiconico(val OptPlatformSnippet) {
	s.Niconico = val
}

// Ref: #/components/schemas/ChannelStatisticsResponse
type ChannelStatisticsResponse struct {
	Youtube     OptPlatformStatistics `json:"Youtube"`
	Twitch      OptPlatformStatistics `json:"Twitch"`
	TwitCasting OptPlatformStatistics `json:"TwitCasting"`
	Niconico    OptPlatformStatistics `json:"Niconico"`
}

// GetYoutube returns the value of Youtube.
func (s *ChannelStatisticsResponse) GetYoutube() OptPlatformStatistics {
	return s.Youtube
}

// GetTwitch returns the value of Twitch.
func (s *ChannelStatisticsResponse) GetTwitch() OptPlatformStatistics {
	return s.Twitch
}

// GetTwitCasting returns the value of TwitCasting.
func (s *ChannelStatisticsResponse) GetTwitCasting() OptPlatformStatistics {
	return s.TwitCasting
}

// GetNiconico returns the value of Niconico.
func (s *ChannelStatisticsResponse) GetNiconico() OptPlatformStatistics {
	return s.Niconico
}

// SetYoutube sets the value of Youtube.
func (s *ChannelStatisticsResponse) SetYoutube(val OptPlatformStatistics) {
	s.Youtube = val
}

// SetTwitch sets the value of Twitch.
func (s *ChannelStatisticsResponse) SetTwitch(val OptPlatformStatistics) {
	s.Twitch = val
}

// SetTwitCasting sets the value of TwitCasting.
func (s *ChannelStatisticsResponse) SetTwitCasting(val OptPlatformStatistics) {
	s.TwitCasting = val
}

// SetNiconico sets the value of Niconico.
func (s *ChannelStatisticsResponse) SetNiconico(val OptPlatformStatistics) {
	s.Niconico = val
}

// Ref: #/components/schemas/CreatorResponse
type CreatorResponse struct {
	ID       OptString         `json:"id"`
	Name     OptString         `json:"name"`
	Channels []ChannelResponse `json:"channels"`
}

// GetID returns the value of ID.
func (s *CreatorResponse) GetID() OptString {
	return s.ID
}

// GetName returns the value of Name.
func (s *CreatorResponse) GetName() OptString {
	return s.Name
}

// GetChannels returns the value of Channels.
func (s *CreatorResponse) GetChannels() []ChannelResponse {
	return s.Channels
}

// SetID sets the value of ID.
func (s *CreatorResponse) SetID(val OptString) {
	s.ID = val
}

// SetName sets the value of Name.
func (s *CreatorResponse) SetName(val OptString) {
	s.Name = val
}

// SetChannels sets the value of Channels.
func (s *CreatorResponse) SetChannels(val []ChannelResponse) {
	s.Channels = val
}

// CreatorsGetBadRequest is response for CreatorsGet operation.
type CreatorsGetBadRequest struct{}

func (*CreatorsGetBadRequest) creatorsGetRes() {}

// CreatorsGetForbidden is response for CreatorsGet operation.
type CreatorsGetForbidden struct{}

func (*CreatorsGetForbidden) creatorsGetRes() {}

// CreatorsGetInternalServerError is response for CreatorsGet operation.
type CreatorsGetInternalServerError struct{}

func (*CreatorsGetInternalServerError) creatorsGetRes() {}

// CreatorsGetNotFound is response for CreatorsGet operation.
type CreatorsGetNotFound struct{}

func (*CreatorsGetNotFound) creatorsGetRes() {}

// CreatorsGetUnauthorized is response for CreatorsGet operation.
type CreatorsGetUnauthorized struct{}

func (*CreatorsGetUnauthorized) creatorsGetRes() {}

// Ref: #/components/schemas/CreatorsResponse
type CreatorsResponse struct {
	Creators   []CreatorResponse `json:"creators"`
	Pagination OptPagination     `json:"pagination"`
}

// GetCreators returns the value of Creators.
func (s *CreatorsResponse) GetCreators() []CreatorResponse {
	return s.Creators
}

// GetPagination returns the value of Pagination.
func (s *CreatorsResponse) GetPagination() OptPagination {
	return s.Pagination
}

// SetCreators sets the value of Creators.
func (s *CreatorsResponse) SetCreators(val []CreatorResponse) {
	s.Creators = val
}

// SetPagination sets the value of Pagination.
func (s *CreatorsResponse) SetPagination(val OptPagination) {
	s.Pagination = val
}

func (*CreatorsResponse) creatorsGetRes() {}

// NewOptBool returns new OptBool with value set to v.
func NewOptBool(v bool) OptBool {
	return OptBool{
		Value: v,
		Set:   true,
	}
}

// OptBool is optional bool.
type OptBool struct {
	Value bool
	Set   bool
}

// IsSet returns true if OptBool was set.
func (o OptBool) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptBool) Reset() {
	var v bool
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptBool) SetTo(v bool) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptBool) Get() (v bool, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptBool) Or(d bool) bool {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptChannelSnippetResponse returns new OptChannelSnippetResponse with value set to v.
func NewOptChannelSnippetResponse(v ChannelSnippetResponse) OptChannelSnippetResponse {
	return OptChannelSnippetResponse{
		Value: v,
		Set:   true,
	}
}

// OptChannelSnippetResponse is optional ChannelSnippetResponse.
type OptChannelSnippetResponse struct {
	Value ChannelSnippetResponse
	Set   bool
}

// IsSet returns true if OptChannelSnippetResponse was set.
func (o OptChannelSnippetResponse) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptChannelSnippetResponse) Reset() {
	var v ChannelSnippetResponse
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptChannelSnippetResponse) SetTo(v ChannelSnippetResponse) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptChannelSnippetResponse) Get() (v ChannelSnippetResponse, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptChannelSnippetResponse) Or(d ChannelSnippetResponse) ChannelSnippetResponse {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptChannelStatisticsResponse returns new OptChannelStatisticsResponse with value set to v.
func NewOptChannelStatisticsResponse(v ChannelStatisticsResponse) OptChannelStatisticsResponse {
	return OptChannelStatisticsResponse{
		Value: v,
		Set:   true,
	}
}

// OptChannelStatisticsResponse is optional ChannelStatisticsResponse.
type OptChannelStatisticsResponse struct {
	Value ChannelStatisticsResponse
	Set   bool
}

// IsSet returns true if OptChannelStatisticsResponse was set.
func (o OptChannelStatisticsResponse) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptChannelStatisticsResponse) Reset() {
	var v ChannelStatisticsResponse
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptChannelStatisticsResponse) SetTo(v ChannelStatisticsResponse) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptChannelStatisticsResponse) Get() (v ChannelStatisticsResponse, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptChannelStatisticsResponse) Or(d ChannelStatisticsResponse) ChannelStatisticsResponse {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptDateTime returns new OptDateTime with value set to v.
func NewOptDateTime(v time.Time) OptDateTime {
	return OptDateTime{
		Value: v,
		Set:   true,
	}
}

// OptDateTime is optional time.Time.
type OptDateTime struct {
	Value time.Time
	Set   bool
}

// IsSet returns true if OptDateTime was set.
func (o OptDateTime) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptDateTime) Reset() {
	var v time.Time
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptDateTime) SetTo(v time.Time) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptDateTime) Get() (v time.Time, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptDateTime) Or(d time.Time) time.Time {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptInt returns new OptInt with value set to v.
func NewOptInt(v int) OptInt {
	return OptInt{
		Value: v,
		Set:   true,
	}
}

// OptInt is optional int.
type OptInt struct {
	Value int
	Set   bool
}

// IsSet returns true if OptInt was set.
func (o OptInt) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptInt) Reset() {
	var v int
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptInt) SetTo(v int) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptInt) Get() (v int, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptInt) Or(d int) int {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptInt64 returns new OptInt64 with value set to v.
func NewOptInt64(v int64) OptInt64 {
	return OptInt64{
		Value: v,
		Set:   true,
	}
}

// OptInt64 is optional int64.
type OptInt64 struct {
	Value int64
	Set   bool
}

// IsSet returns true if OptInt64 was set.
func (o OptInt64) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptInt64) Reset() {
	var v int64
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptInt64) SetTo(v int64) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptInt64) Get() (v int64, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptInt64) Or(d int64) int64 {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptPagination returns new OptPagination with value set to v.
func NewOptPagination(v Pagination) OptPagination {
	return OptPagination{
		Value: v,
		Set:   true,
	}
}

// OptPagination is optional Pagination.
type OptPagination struct {
	Value Pagination
	Set   bool
}

// IsSet returns true if OptPagination was set.
func (o OptPagination) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptPagination) Reset() {
	var v Pagination
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptPagination) SetTo(v Pagination) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptPagination) Get() (v Pagination, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptPagination) Or(d Pagination) Pagination {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptPlatformSnippet returns new OptPlatformSnippet with value set to v.
func NewOptPlatformSnippet(v PlatformSnippet) OptPlatformSnippet {
	return OptPlatformSnippet{
		Value: v,
		Set:   true,
	}
}

// OptPlatformSnippet is optional PlatformSnippet.
type OptPlatformSnippet struct {
	Value PlatformSnippet
	Set   bool
}

// IsSet returns true if OptPlatformSnippet was set.
func (o OptPlatformSnippet) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptPlatformSnippet) Reset() {
	var v PlatformSnippet
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptPlatformSnippet) SetTo(v PlatformSnippet) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptPlatformSnippet) Get() (v PlatformSnippet, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptPlatformSnippet) Or(d PlatformSnippet) PlatformSnippet {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptPlatformStatistics returns new OptPlatformStatistics with value set to v.
func NewOptPlatformStatistics(v PlatformStatistics) OptPlatformStatistics {
	return OptPlatformStatistics{
		Value: v,
		Set:   true,
	}
}

// OptPlatformStatistics is optional PlatformStatistics.
type OptPlatformStatistics struct {
	Value PlatformStatistics
	Set   bool
}

// IsSet returns true if OptPlatformStatistics was set.
func (o OptPlatformStatistics) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptPlatformStatistics) Reset() {
	var v PlatformStatistics
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptPlatformStatistics) SetTo(v PlatformStatistics) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptPlatformStatistics) Get() (v PlatformStatistics, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptPlatformStatistics) Or(d PlatformStatistics) PlatformStatistics {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptString returns new OptString with value set to v.
func NewOptString(v string) OptString {
	return OptString{
		Value: v,
		Set:   true,
	}
}

// OptString is optional string.
type OptString struct {
	Value string
	Set   bool
}

// IsSet returns true if OptString was set.
func (o OptString) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptString) Reset() {
	var v string
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptString) SetTo(v string) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptString) Get() (v string, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptString) Or(d string) string {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptThumbnailResponse returns new OptThumbnailResponse with value set to v.
func NewOptThumbnailResponse(v ThumbnailResponse) OptThumbnailResponse {
	return OptThumbnailResponse{
		Value: v,
		Set:   true,
	}
}

// OptThumbnailResponse is optional ThumbnailResponse.
type OptThumbnailResponse struct {
	Value ThumbnailResponse
	Set   bool
}

// IsSet returns true if OptThumbnailResponse was set.
func (o OptThumbnailResponse) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptThumbnailResponse) Reset() {
	var v ThumbnailResponse
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptThumbnailResponse) SetTo(v ThumbnailResponse) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptThumbnailResponse) Get() (v ThumbnailResponse, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptThumbnailResponse) Or(d ThumbnailResponse) ThumbnailResponse {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptThumbnailsResponse returns new OptThumbnailsResponse with value set to v.
func NewOptThumbnailsResponse(v ThumbnailsResponse) OptThumbnailsResponse {
	return OptThumbnailsResponse{
		Value: v,
		Set:   true,
	}
}

// OptThumbnailsResponse is optional ThumbnailsResponse.
type OptThumbnailsResponse struct {
	Value ThumbnailsResponse
	Set   bool
}

// IsSet returns true if OptThumbnailsResponse was set.
func (o OptThumbnailsResponse) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptThumbnailsResponse) Reset() {
	var v ThumbnailsResponse
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptThumbnailsResponse) SetTo(v ThumbnailsResponse) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptThumbnailsResponse) Get() (v ThumbnailsResponse, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptThumbnailsResponse) Or(d ThumbnailsResponse) ThumbnailsResponse {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// NewOptVideoResponsePlatform returns new OptVideoResponsePlatform with value set to v.
func NewOptVideoResponsePlatform(v VideoResponsePlatform) OptVideoResponsePlatform {
	return OptVideoResponsePlatform{
		Value: v,
		Set:   true,
	}
}

// OptVideoResponsePlatform is optional VideoResponsePlatform.
type OptVideoResponsePlatform struct {
	Value VideoResponsePlatform
	Set   bool
}

// IsSet returns true if OptVideoResponsePlatform was set.
func (o OptVideoResponsePlatform) IsSet() bool { return o.Set }

// Reset unsets value.
func (o *OptVideoResponsePlatform) Reset() {
	var v VideoResponsePlatform
	o.Value = v
	o.Set = false
}

// SetTo sets value to v.
func (o *OptVideoResponsePlatform) SetTo(v VideoResponsePlatform) {
	o.Set = true
	o.Value = v
}

// Get returns value and boolean that denotes whether value was set.
func (o OptVideoResponsePlatform) Get() (v VideoResponsePlatform, ok bool) {
	if !o.Set {
		return v, false
	}
	return o.Value, true
}

// Or returns value if set, or given parameter if does not.
func (o OptVideoResponsePlatform) Or(d VideoResponsePlatform) VideoResponsePlatform {
	if v, ok := o.Get(); ok {
		return v
	}
	return d
}

// Ref: #/components/schemas/Pagination
type Pagination struct {
	CurrentPage OptInt64 `json:"CurrentPage"`
	PrevPage    OptInt64 `json:"PrevPage"`
	NextPage    OptInt64 `json:"NextPage"`
	TotalPage   OptInt64 `json:"TotalPage"`
	TotalCount  OptInt64 `json:"TotalCount"`
	HasNext     OptBool  `json:"HasNext"`
}

// GetCurrentPage returns the value of CurrentPage.
func (s *Pagination) GetCurrentPage() OptInt64 {
	return s.CurrentPage
}

// GetPrevPage returns the value of PrevPage.
func (s *Pagination) GetPrevPage() OptInt64 {
	return s.PrevPage
}

// GetNextPage returns the value of NextPage.
func (s *Pagination) GetNextPage() OptInt64 {
	return s.NextPage
}

// GetTotalPage returns the value of TotalPage.
func (s *Pagination) GetTotalPage() OptInt64 {
	return s.TotalPage
}

// GetTotalCount returns the value of TotalCount.
func (s *Pagination) GetTotalCount() OptInt64 {
	return s.TotalCount
}

// GetHasNext returns the value of HasNext.
func (s *Pagination) GetHasNext() OptBool {
	return s.HasNext
}

// SetCurrentPage sets the value of CurrentPage.
func (s *Pagination) SetCurrentPage(val OptInt64) {
	s.CurrentPage = val
}

// SetPrevPage sets the value of PrevPage.
func (s *Pagination) SetPrevPage(val OptInt64) {
	s.PrevPage = val
}

// SetNextPage sets the value of NextPage.
func (s *Pagination) SetNextPage(val OptInt64) {
	s.NextPage = val
}

// SetTotalPage sets the value of TotalPage.
func (s *Pagination) SetTotalPage(val OptInt64) {
	s.TotalPage = val
}

// SetTotalCount sets the value of TotalCount.
func (s *Pagination) SetTotalCount(val OptInt64) {
	s.TotalCount = val
}

// SetHasNext sets the value of HasNext.
func (s *Pagination) SetHasNext(val OptBool) {
	s.HasNext = val
}

// Ref: #/components/schemas/PlatformSnippet
type PlatformSnippet struct {
	Title       OptString             `json:"Title"`
	Description OptString             `json:"Description"`
	CustomURL   OptString             `json:"CustomURL"`
	PublishedAt OptDateTime           `json:"PublishedAt"`
	Thumbnails  OptThumbnailsResponse `json:"Thumbnails"`
}

// GetTitle returns the value of Title.
func (s *PlatformSnippet) GetTitle() OptString {
	return s.Title
}

// GetDescription returns the value of Description.
func (s *PlatformSnippet) GetDescription() OptString {
	return s.Description
}

// GetCustomURL returns the value of CustomURL.
func (s *PlatformSnippet) GetCustomURL() OptString {
	return s.CustomURL
}

// GetPublishedAt returns the value of PublishedAt.
func (s *PlatformSnippet) GetPublishedAt() OptDateTime {
	return s.PublishedAt
}

// GetThumbnails returns the value of Thumbnails.
func (s *PlatformSnippet) GetThumbnails() OptThumbnailsResponse {
	return s.Thumbnails
}

// SetTitle sets the value of Title.
func (s *PlatformSnippet) SetTitle(val OptString) {
	s.Title = val
}

// SetDescription sets the value of Description.
func (s *PlatformSnippet) SetDescription(val OptString) {
	s.Description = val
}

// SetCustomURL sets the value of CustomURL.
func (s *PlatformSnippet) SetCustomURL(val OptString) {
	s.CustomURL = val
}

// SetPublishedAt sets the value of PublishedAt.
func (s *PlatformSnippet) SetPublishedAt(val OptDateTime) {
	s.PublishedAt = val
}

// SetThumbnails sets the value of Thumbnails.
func (s *PlatformSnippet) SetThumbnails(val OptThumbnailsResponse) {
	s.Thumbnails = val
}

// Ref: #/components/schemas/PlatformStatistics
type PlatformStatistics struct {
	ViewCount             OptString `json:"ViewCount"`
	SubscriberCount       OptString `json:"SubscriberCount"`
	HiddenSubscriberCount OptBool   `json:"HiddenSubscriberCount"`
	VideoCount            OptString `json:"VideoCount"`
}

// GetViewCount returns the value of ViewCount.
func (s *PlatformStatistics) GetViewCount() OptString {
	return s.ViewCount
}

// GetSubscriberCount returns the value of SubscriberCount.
func (s *PlatformStatistics) GetSubscriberCount() OptString {
	return s.SubscriberCount
}

// GetHiddenSubscriberCount returns the value of HiddenSubscriberCount.
func (s *PlatformStatistics) GetHiddenSubscriberCount() OptBool {
	return s.HiddenSubscriberCount
}

// GetVideoCount returns the value of VideoCount.
func (s *PlatformStatistics) GetVideoCount() OptString {
	return s.VideoCount
}

// SetViewCount sets the value of ViewCount.
func (s *PlatformStatistics) SetViewCount(val OptString) {
	s.ViewCount = val
}

// SetSubscriberCount sets the value of SubscriberCount.
func (s *PlatformStatistics) SetSubscriberCount(val OptString) {
	s.SubscriberCount = val
}

// SetHiddenSubscriberCount sets the value of HiddenSubscriberCount.
func (s *PlatformStatistics) SetHiddenSubscriberCount(val OptBool) {
	s.HiddenSubscriberCount = val
}

// SetVideoCount sets the value of VideoCount.
func (s *PlatformStatistics) SetVideoCount(val OptString) {
	s.VideoCount = val
}

// Ref: #/components/schemas/ThumbnailResponse
type ThumbnailResponse struct {
	Height OptInt    `json:"height"`
	URL    OptString `json:"url"`
	Width  OptInt    `json:"width"`
}

// GetHeight returns the value of Height.
func (s *ThumbnailResponse) GetHeight() OptInt {
	return s.Height
}

// GetURL returns the value of URL.
func (s *ThumbnailResponse) GetURL() OptString {
	return s.URL
}

// GetWidth returns the value of Width.
func (s *ThumbnailResponse) GetWidth() OptInt {
	return s.Width
}

// SetHeight sets the value of Height.
func (s *ThumbnailResponse) SetHeight(val OptInt) {
	s.Height = val
}

// SetURL sets the value of URL.
func (s *ThumbnailResponse) SetURL(val OptString) {
	s.URL = val
}

// SetWidth sets the value of Width.
func (s *ThumbnailResponse) SetWidth(val OptInt) {
	s.Width = val
}

// Ref: #/components/schemas/ThumbnailsResponse
type ThumbnailsResponse struct {
	Default  OptThumbnailResponse `json:"default"`
	High     OptThumbnailResponse `json:"high"`
	Maxres   OptThumbnailResponse `json:"maxres"`
	Medium   OptThumbnailResponse `json:"medium"`
	Standard OptThumbnailResponse `json:"standard"`
}

// GetDefault returns the value of Default.
func (s *ThumbnailsResponse) GetDefault() OptThumbnailResponse {
	return s.Default
}

// GetHigh returns the value of High.
func (s *ThumbnailsResponse) GetHigh() OptThumbnailResponse {
	return s.High
}

// GetMaxres returns the value of Maxres.
func (s *ThumbnailsResponse) GetMaxres() OptThumbnailResponse {
	return s.Maxres
}

// GetMedium returns the value of Medium.
func (s *ThumbnailsResponse) GetMedium() OptThumbnailResponse {
	return s.Medium
}

// GetStandard returns the value of Standard.
func (s *ThumbnailsResponse) GetStandard() OptThumbnailResponse {
	return s.Standard
}

// SetDefault sets the value of Default.
func (s *ThumbnailsResponse) SetDefault(val OptThumbnailResponse) {
	s.Default = val
}

// SetHigh sets the value of High.
func (s *ThumbnailsResponse) SetHigh(val OptThumbnailResponse) {
	s.High = val
}

// SetMaxres sets the value of Maxres.
func (s *ThumbnailsResponse) SetMaxres(val OptThumbnailResponse) {
	s.Maxres = val
}

// SetMedium sets the value of Medium.
func (s *ThumbnailsResponse) SetMedium(val OptThumbnailResponse) {
	s.Medium = val
}

// SetStandard sets the value of Standard.
func (s *ThumbnailsResponse) SetStandard(val OptThumbnailResponse) {
	s.Standard = val
}

// Ref: #/components/schemas/VideoResponse
type VideoResponse struct {
	ChannelId    OptString                `json:"channelId"`
	ChannelTitle OptString                `json:"channelTitle"`
	Description  OptString                `json:"description"`
	ID           OptString                `json:"id"`
	PublishedAt  OptDateTime              `json:"publishedAt"`
	StartAt      OptDateTime              `json:"startAt"`
	EndAt        OptDateTime              `json:"endAt"`
	Tags         []string                 `json:"tags"`
	Thumbnails   OptThumbnailsResponse    `json:"thumbnails"`
	Title        OptString                `json:"title"`
	Platform     OptVideoResponsePlatform `json:"platform"`
}

// GetChannelId returns the value of ChannelId.
func (s *VideoResponse) GetChannelId() OptString {
	return s.ChannelId
}

// GetChannelTitle returns the value of ChannelTitle.
func (s *VideoResponse) GetChannelTitle() OptString {
	return s.ChannelTitle
}

// GetDescription returns the value of Description.
func (s *VideoResponse) GetDescription() OptString {
	return s.Description
}

// GetID returns the value of ID.
func (s *VideoResponse) GetID() OptString {
	return s.ID
}

// GetPublishedAt returns the value of PublishedAt.
func (s *VideoResponse) GetPublishedAt() OptDateTime {
	return s.PublishedAt
}

// GetStartAt returns the value of StartAt.
func (s *VideoResponse) GetStartAt() OptDateTime {
	return s.StartAt
}

// GetEndAt returns the value of EndAt.
func (s *VideoResponse) GetEndAt() OptDateTime {
	return s.EndAt
}

// GetTags returns the value of Tags.
func (s *VideoResponse) GetTags() []string {
	return s.Tags
}

// GetThumbnails returns the value of Thumbnails.
func (s *VideoResponse) GetThumbnails() OptThumbnailsResponse {
	return s.Thumbnails
}

// GetTitle returns the value of Title.
func (s *VideoResponse) GetTitle() OptString {
	return s.Title
}

// GetPlatform returns the value of Platform.
func (s *VideoResponse) GetPlatform() OptVideoResponsePlatform {
	return s.Platform
}

// SetChannelId sets the value of ChannelId.
func (s *VideoResponse) SetChannelId(val OptString) {
	s.ChannelId = val
}

// SetChannelTitle sets the value of ChannelTitle.
func (s *VideoResponse) SetChannelTitle(val OptString) {
	s.ChannelTitle = val
}

// SetDescription sets the value of Description.
func (s *VideoResponse) SetDescription(val OptString) {
	s.Description = val
}

// SetID sets the value of ID.
func (s *VideoResponse) SetID(val OptString) {
	s.ID = val
}

// SetPublishedAt sets the value of PublishedAt.
func (s *VideoResponse) SetPublishedAt(val OptDateTime) {
	s.PublishedAt = val
}

// SetStartAt sets the value of StartAt.
func (s *VideoResponse) SetStartAt(val OptDateTime) {
	s.StartAt = val
}

// SetEndAt sets the value of EndAt.
func (s *VideoResponse) SetEndAt(val OptDateTime) {
	s.EndAt = val
}

// SetTags sets the value of Tags.
func (s *VideoResponse) SetTags(val []string) {
	s.Tags = val
}

// SetThumbnails sets the value of Thumbnails.
func (s *VideoResponse) SetThumbnails(val OptThumbnailsResponse) {
	s.Thumbnails = val
}

// SetTitle sets the value of Title.
func (s *VideoResponse) SetTitle(val OptString) {
	s.Title = val
}

// SetPlatform sets the value of Platform.
func (s *VideoResponse) SetPlatform(val OptVideoResponsePlatform) {
	s.Platform = val
}

type VideoResponsePlatform string

const (
	VideoResponsePlatformYoutube     VideoResponsePlatform = "youtube"
	VideoResponsePlatformTwitch      VideoResponsePlatform = "twitch"
	VideoResponsePlatformTwitcasting VideoResponsePlatform = "twitcasting"
	VideoResponsePlatformNiconico    VideoResponsePlatform = "niconico"
	VideoResponsePlatformUnknown     VideoResponsePlatform = "unknown"
)

// AllValues returns all VideoResponsePlatform values.
func (VideoResponsePlatform) AllValues() []VideoResponsePlatform {
	return []VideoResponsePlatform{
		VideoResponsePlatformYoutube,
		VideoResponsePlatformTwitch,
		VideoResponsePlatformTwitcasting,
		VideoResponsePlatformNiconico,
		VideoResponsePlatformUnknown,
	}
}

// MarshalText implements encoding.TextMarshaler.
func (s VideoResponsePlatform) MarshalText() ([]byte, error) {
	switch s {
	case VideoResponsePlatformYoutube:
		return []byte(s), nil
	case VideoResponsePlatformTwitch:
		return []byte(s), nil
	case VideoResponsePlatformTwitcasting:
		return []byte(s), nil
	case VideoResponsePlatformNiconico:
		return []byte(s), nil
	case VideoResponsePlatformUnknown:
		return []byte(s), nil
	default:
		return nil, errors.Errorf("invalid value: %q", s)
	}
}

// UnmarshalText implements encoding.TextUnmarshaler.
func (s *VideoResponsePlatform) UnmarshalText(data []byte) error {
	switch VideoResponsePlatform(data) {
	case VideoResponsePlatformYoutube:
		*s = VideoResponsePlatformYoutube
		return nil
	case VideoResponsePlatformTwitch:
		*s = VideoResponsePlatformTwitch
		return nil
	case VideoResponsePlatformTwitcasting:
		*s = VideoResponsePlatformTwitcasting
		return nil
	case VideoResponsePlatformNiconico:
		*s = VideoResponsePlatformNiconico
		return nil
	case VideoResponsePlatformUnknown:
		*s = VideoResponsePlatformUnknown
		return nil
	default:
		return errors.Errorf("invalid value: %q", data)
	}
}

// VideosGetBadRequest is response for VideosGet operation.
type VideosGetBadRequest struct{}

func (*VideosGetBadRequest) videosGetRes() {}

// VideosGetForbidden is response for VideosGet operation.
type VideosGetForbidden struct{}

func (*VideosGetForbidden) videosGetRes() {}

// VideosGetInternalServerError is response for VideosGet operation.
type VideosGetInternalServerError struct{}

func (*VideosGetInternalServerError) videosGetRes() {}

// VideosGetNotFound is response for VideosGet operation.
type VideosGetNotFound struct{}

func (*VideosGetNotFound) videosGetRes() {}

// VideosGetUnauthorized is response for VideosGet operation.
type VideosGetUnauthorized struct{}

func (*VideosGetUnauthorized) videosGetRes() {}

// VideosPostBadRequest is response for VideosPost operation.
type VideosPostBadRequest struct{}

func (*VideosPostBadRequest) videosPostRes() {}

// VideosPostForbidden is response for VideosPost operation.
type VideosPostForbidden struct{}

func (*VideosPostForbidden) videosPostRes() {}

// VideosPostInternalServerError is response for VideosPost operation.
type VideosPostInternalServerError struct{}

func (*VideosPostInternalServerError) videosPostRes() {}

// VideosPostNotFound is response for VideosPost operation.
type VideosPostNotFound struct{}

func (*VideosPostNotFound) videosPostRes() {}

type VideosPostReq struct {
	// Array of YouTube Video IDs.
	Ids []string `json:"ids"`
}

// GetIds returns the value of Ids.
func (s *VideosPostReq) GetIds() []string {
	return s.Ids
}

// SetIds sets the value of Ids.
func (s *VideosPostReq) SetIds(val []string) {
	s.Ids = val
}

// VideosPostUnauthorized is response for VideosPost operation.
type VideosPostUnauthorized struct{}

func (*VideosPostUnauthorized) videosPostRes() {}

// VideosPutBadRequest is response for VideosPut operation.
type VideosPutBadRequest struct{}

func (*VideosPutBadRequest) videosPutRes() {}

// VideosPutForbidden is response for VideosPut operation.
type VideosPutForbidden struct{}

func (*VideosPutForbidden) videosPutRes() {}

// VideosPutInternalServerError is response for VideosPut operation.
type VideosPutInternalServerError struct{}

func (*VideosPutInternalServerError) videosPutRes() {}

// VideosPutNotFound is response for VideosPut operation.
type VideosPutNotFound struct{}

func (*VideosPutNotFound) videosPutRes() {}

type VideosPutReq struct {
	// Array of YouTube Video IDs.
	Ids []string `json:"ids"`
}

// GetIds returns the value of Ids.
func (s *VideosPutReq) GetIds() []string {
	return s.Ids
}

// SetIds sets the value of Ids.
func (s *VideosPutReq) SetIds(val []string) {
	s.Ids = val
}

// VideosPutUnauthorized is response for VideosPut operation.
type VideosPutUnauthorized struct{}

func (*VideosPutUnauthorized) videosPutRes() {}

// Ref: #/components/schemas/VideosResponse
type VideosResponse struct {
	Videos     []VideoResponse `json:"videos"`
	Pagination OptPagination   `json:"pagination"`
}

// GetVideos returns the value of Videos.
func (s *VideosResponse) GetVideos() []VideoResponse {
	return s.Videos
}

// GetPagination returns the value of Pagination.
func (s *VideosResponse) GetPagination() OptPagination {
	return s.Pagination
}

// SetVideos sets the value of Videos.
func (s *VideosResponse) SetVideos(val []VideoResponse) {
	s.Videos = val
}

// SetPagination sets the value of Pagination.
func (s *VideosResponse) SetPagination(val OptPagination) {
	s.Pagination = val
}

func (*VideosResponse) videosGetRes()  {}
func (*VideosResponse) videosPostRes() {}
func (*VideosResponse) videosPutRes()  {}
