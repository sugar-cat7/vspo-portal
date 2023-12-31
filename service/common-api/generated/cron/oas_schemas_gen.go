// Code generated by ogen, DO NOT EDIT.

package api

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

// ChannelsChannelIDVideosPostBadRequest is response for ChannelsChannelIDVideosPost operation.
type ChannelsChannelIDVideosPostBadRequest struct{}

func (*ChannelsChannelIDVideosPostBadRequest) channelsChannelIDVideosPostRes() {}

// ChannelsChannelIDVideosPostForbidden is response for ChannelsChannelIDVideosPost operation.
type ChannelsChannelIDVideosPostForbidden struct{}

func (*ChannelsChannelIDVideosPostForbidden) channelsChannelIDVideosPostRes() {}

// ChannelsChannelIDVideosPostInternalServerError is response for ChannelsChannelIDVideosPost operation.
type ChannelsChannelIDVideosPostInternalServerError struct{}

func (*ChannelsChannelIDVideosPostInternalServerError) channelsChannelIDVideosPostRes() {}

// ChannelsChannelIDVideosPostNotFound is response for ChannelsChannelIDVideosPost operation.
type ChannelsChannelIDVideosPostNotFound struct{}

func (*ChannelsChannelIDVideosPostNotFound) channelsChannelIDVideosPostRes() {}

type ChannelsChannelIDVideosPostOKApplicationJSON string

func (*ChannelsChannelIDVideosPostOKApplicationJSON) channelsChannelIDVideosPostRes() {}

type ChannelsChannelIDVideosPostReq struct {
	// Array of YouTube channel IDs.
	Ids       []string  `json:"ids"`
	StartDate OptString `json:"start_date"`
	EndDate   OptString `json:"end_date"`
}

// GetIds returns the value of Ids.
func (s *ChannelsChannelIDVideosPostReq) GetIds() []string {
	return s.Ids
}

// GetStartDate returns the value of StartDate.
func (s *ChannelsChannelIDVideosPostReq) GetStartDate() OptString {
	return s.StartDate
}

// GetEndDate returns the value of EndDate.
func (s *ChannelsChannelIDVideosPostReq) GetEndDate() OptString {
	return s.EndDate
}

// SetIds sets the value of Ids.
func (s *ChannelsChannelIDVideosPostReq) SetIds(val []string) {
	s.Ids = val
}

// SetStartDate sets the value of StartDate.
func (s *ChannelsChannelIDVideosPostReq) SetStartDate(val OptString) {
	s.StartDate = val
}

// SetEndDate sets the value of EndDate.
func (s *ChannelsChannelIDVideosPostReq) SetEndDate(val OptString) {
	s.EndDate = val
}

// ChannelsChannelIDVideosPostUnauthorized is response for ChannelsChannelIDVideosPost operation.
type ChannelsChannelIDVideosPostUnauthorized struct{}

func (*ChannelsChannelIDVideosPostUnauthorized) channelsChannelIDVideosPostRes() {}

// ChannelsChannelIDVideosPutBadRequest is response for ChannelsChannelIDVideosPut operation.
type ChannelsChannelIDVideosPutBadRequest struct{}

func (*ChannelsChannelIDVideosPutBadRequest) channelsChannelIDVideosPutRes() {}

// ChannelsChannelIDVideosPutForbidden is response for ChannelsChannelIDVideosPut operation.
type ChannelsChannelIDVideosPutForbidden struct{}

func (*ChannelsChannelIDVideosPutForbidden) channelsChannelIDVideosPutRes() {}

// ChannelsChannelIDVideosPutInternalServerError is response for ChannelsChannelIDVideosPut operation.
type ChannelsChannelIDVideosPutInternalServerError struct{}

func (*ChannelsChannelIDVideosPutInternalServerError) channelsChannelIDVideosPutRes() {}

// ChannelsChannelIDVideosPutNotFound is response for ChannelsChannelIDVideosPut operation.
type ChannelsChannelIDVideosPutNotFound struct{}

func (*ChannelsChannelIDVideosPutNotFound) channelsChannelIDVideosPutRes() {}

type ChannelsChannelIDVideosPutOKApplicationJSON string

func (*ChannelsChannelIDVideosPutOKApplicationJSON) channelsChannelIDVideosPutRes() {}

type ChannelsChannelIDVideosPutReq struct {
	// Array of YouTube channel IDs.
	Ids       []string  `json:"ids"`
	StartDate OptString `json:"start_date"`
	EndDate   OptString `json:"end_date"`
}

// GetIds returns the value of Ids.
func (s *ChannelsChannelIDVideosPutReq) GetIds() []string {
	return s.Ids
}

// GetStartDate returns the value of StartDate.
func (s *ChannelsChannelIDVideosPutReq) GetStartDate() OptString {
	return s.StartDate
}

// GetEndDate returns the value of EndDate.
func (s *ChannelsChannelIDVideosPutReq) GetEndDate() OptString {
	return s.EndDate
}

// SetIds sets the value of Ids.
func (s *ChannelsChannelIDVideosPutReq) SetIds(val []string) {
	s.Ids = val
}

// SetStartDate sets the value of StartDate.
func (s *ChannelsChannelIDVideosPutReq) SetStartDate(val OptString) {
	s.StartDate = val
}

// SetEndDate sets the value of EndDate.
func (s *ChannelsChannelIDVideosPutReq) SetEndDate(val OptString) {
	s.EndDate = val
}

// ChannelsChannelIDVideosPutUnauthorized is response for ChannelsChannelIDVideosPut operation.
type ChannelsChannelIDVideosPutUnauthorized struct{}

func (*ChannelsChannelIDVideosPutUnauthorized) channelsChannelIDVideosPutRes() {}

// ChannelsPostBadRequest is response for ChannelsPost operation.
type ChannelsPostBadRequest struct{}

func (*ChannelsPostBadRequest) channelsPostRes() {}

// ChannelsPostForbidden is response for ChannelsPost operation.
type ChannelsPostForbidden struct{}

func (*ChannelsPostForbidden) channelsPostRes() {}

// ChannelsPostInternalServerError is response for ChannelsPost operation.
type ChannelsPostInternalServerError struct{}

func (*ChannelsPostInternalServerError) channelsPostRes() {}

// ChannelsPostNotFound is response for ChannelsPost operation.
type ChannelsPostNotFound struct{}

func (*ChannelsPostNotFound) channelsPostRes() {}

type ChannelsPostOKApplicationJSON string

func (*ChannelsPostOKApplicationJSON) channelsPostRes() {}

type ChannelsPostReq struct {
	// Array of YouTube channel IDs.
	Ids       []string  `json:"ids"`
	StartDate OptString `json:"start_date"`
	EndDate   OptString `json:"end_date"`
}

// GetIds returns the value of Ids.
func (s *ChannelsPostReq) GetIds() []string {
	return s.Ids
}

// GetStartDate returns the value of StartDate.
func (s *ChannelsPostReq) GetStartDate() OptString {
	return s.StartDate
}

// GetEndDate returns the value of EndDate.
func (s *ChannelsPostReq) GetEndDate() OptString {
	return s.EndDate
}

// SetIds sets the value of Ids.
func (s *ChannelsPostReq) SetIds(val []string) {
	s.Ids = val
}

// SetStartDate sets the value of StartDate.
func (s *ChannelsPostReq) SetStartDate(val OptString) {
	s.StartDate = val
}

// SetEndDate sets the value of EndDate.
func (s *ChannelsPostReq) SetEndDate(val OptString) {
	s.EndDate = val
}

// ChannelsPostUnauthorized is response for ChannelsPost operation.
type ChannelsPostUnauthorized struct{}

func (*ChannelsPostUnauthorized) channelsPostRes() {}

// ChannelsPutBadRequest is response for ChannelsPut operation.
type ChannelsPutBadRequest struct{}

func (*ChannelsPutBadRequest) channelsPutRes() {}

// ChannelsPutForbidden is response for ChannelsPut operation.
type ChannelsPutForbidden struct{}

func (*ChannelsPutForbidden) channelsPutRes() {}

// ChannelsPutInternalServerError is response for ChannelsPut operation.
type ChannelsPutInternalServerError struct{}

func (*ChannelsPutInternalServerError) channelsPutRes() {}

// ChannelsPutNotFound is response for ChannelsPut operation.
type ChannelsPutNotFound struct{}

func (*ChannelsPutNotFound) channelsPutRes() {}

type ChannelsPutOKApplicationJSON string

func (*ChannelsPutOKApplicationJSON) channelsPutRes() {}

type ChannelsPutReq struct {
	// Array of YouTube channel IDs.
	Ids       []string  `json:"ids"`
	StartDate OptString `json:"start_date"`
	EndDate   OptString `json:"end_date"`
}

// GetIds returns the value of Ids.
func (s *ChannelsPutReq) GetIds() []string {
	return s.Ids
}

// GetStartDate returns the value of StartDate.
func (s *ChannelsPutReq) GetStartDate() OptString {
	return s.StartDate
}

// GetEndDate returns the value of EndDate.
func (s *ChannelsPutReq) GetEndDate() OptString {
	return s.EndDate
}

// SetIds sets the value of Ids.
func (s *ChannelsPutReq) SetIds(val []string) {
	s.Ids = val
}

// SetStartDate sets the value of StartDate.
func (s *ChannelsPutReq) SetStartDate(val OptString) {
	s.StartDate = val
}

// SetEndDate sets the value of EndDate.
func (s *ChannelsPutReq) SetEndDate(val OptString) {
	s.EndDate = val
}

// ChannelsPutUnauthorized is response for ChannelsPut operation.
type ChannelsPutUnauthorized struct{}

func (*ChannelsPutUnauthorized) channelsPutRes() {}

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
