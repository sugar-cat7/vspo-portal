// Code generated by ogen, DO NOT EDIT.

package api

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/ogen-go/ogen/uri"
)

func (s *Server) cutPrefix(path string) (string, bool) {
	prefix := s.cfg.Prefix
	if prefix == "" {
		return path, true
	}
	if !strings.HasPrefix(path, prefix) {
		// Prefix doesn't match.
		return "", false
	}
	// Cut prefix from the path.
	return strings.TrimPrefix(path, prefix), true
}

// ServeHTTP serves http request as defined by OpenAPI v3 specification,
// calling handler that matches the path or returning not found error.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	elem := r.URL.Path
	elemIsEscaped := false
	if rawPath := r.URL.RawPath; rawPath != "" {
		if normalized, ok := uri.NormalizeEscapedPath(rawPath); ok {
			elem = normalized
			elemIsEscaped = strings.ContainsRune(elem, '%')
		}
	}

	elem, ok := s.cutPrefix(elem)
	if !ok || len(elem) == 0 {
		s.notFound(w, r)
		return
	}
	args := [1]string{}

	// Static code generated router with unwrapped path search.
	switch {
	default:
		if len(elem) == 0 {
			break
		}
		switch elem[0] {
		case '/': // Prefix: "/channels"
			if l := len("/channels"); len(elem) >= l && elem[0:l] == "/channels" {
				elem = elem[l:]
			} else {
				break
			}

			if len(elem) == 0 {
				switch r.Method {
				case "GET":
					s.handleChannelsGetRequest([0]string{}, elemIsEscaped, w, r)
				case "POST":
					s.handleChannelsPostRequest([0]string{}, elemIsEscaped, w, r)
				case "PUT":
					s.handleChannelsPutRequest([0]string{}, elemIsEscaped, w, r)
				default:
					s.notAllowed(w, r, "GET,POST,PUT")
				}

				return
			}
			switch elem[0] {
			case '/': // Prefix: "/"
				if l := len("/"); len(elem) >= l && elem[0:l] == "/" {
					elem = elem[l:]
				} else {
					break
				}

				// Param: "channel_id"
				// Match until "/"
				idx := strings.IndexByte(elem, '/')
				if idx < 0 {
					idx = len(elem)
				}
				args[0] = elem[:idx]
				elem = elem[idx:]

				if len(elem) == 0 {
					break
				}
				switch elem[0] {
				case '/': // Prefix: "/videos"
					if l := len("/videos"); len(elem) >= l && elem[0:l] == "/videos" {
						elem = elem[l:]
					} else {
						break
					}

					if len(elem) == 0 {
						// Leaf node.
						switch r.Method {
						case "GET":
							s.handleChannelsChannelIDVideosGetRequest([1]string{
								args[0],
							}, elemIsEscaped, w, r)
						case "POST":
							s.handleChannelsChannelIDVideosPostRequest([1]string{
								args[0],
							}, elemIsEscaped, w, r)
						case "PUT":
							s.handleChannelsChannelIDVideosPutRequest([1]string{
								args[0],
							}, elemIsEscaped, w, r)
						default:
							s.notAllowed(w, r, "GET,POST,PUT")
						}

						return
					}
				}
			}
		}
	}
	s.notFound(w, r)
}

// Route is route object.
type Route struct {
	name        string
	summary     string
	operationID string
	pathPattern string
	count       int
	args        [1]string
}

// Name returns ogen operation name.
//
// It is guaranteed to be unique and not empty.
func (r Route) Name() string {
	return r.name
}

// Summary returns OpenAPI summary.
func (r Route) Summary() string {
	return r.summary
}

// OperationID returns OpenAPI operationId.
func (r Route) OperationID() string {
	return r.operationID
}

// PathPattern returns OpenAPI path.
func (r Route) PathPattern() string {
	return r.pathPattern
}

// Args returns parsed arguments.
func (r Route) Args() []string {
	return r.args[:r.count]
}

// FindRoute finds Route for given method and path.
//
// Note: this method does not unescape path or handle reserved characters in path properly. Use FindPath instead.
func (s *Server) FindRoute(method, path string) (Route, bool) {
	return s.FindPath(method, &url.URL{Path: path})
}

// FindPath finds Route for given method and URL.
func (s *Server) FindPath(method string, u *url.URL) (r Route, _ bool) {
	var (
		elem = u.Path
		args = r.args
	)
	if rawPath := u.RawPath; rawPath != "" {
		if normalized, ok := uri.NormalizeEscapedPath(rawPath); ok {
			elem = normalized
		}
		defer func() {
			for i, arg := range r.args[:r.count] {
				if unescaped, err := url.PathUnescape(arg); err == nil {
					r.args[i] = unescaped
				}
			}
		}()
	}

	elem, ok := s.cutPrefix(elem)
	if !ok {
		return r, false
	}

	// Static code generated router with unwrapped path search.
	switch {
	default:
		if len(elem) == 0 {
			break
		}
		switch elem[0] {
		case '/': // Prefix: "/channels"
			if l := len("/channels"); len(elem) >= l && elem[0:l] == "/channels" {
				elem = elem[l:]
			} else {
				break
			}

			if len(elem) == 0 {
				switch method {
				case "GET":
					r.name = "ChannelsGet"
					r.summary = "Get Channels"
					r.operationID = ""
					r.pathPattern = "/channels"
					r.args = args
					r.count = 0
					return r, true
				case "POST":
					r.name = "ChannelsPost"
					r.summary = "Create Channels from Youtube"
					r.operationID = ""
					r.pathPattern = "/channels"
					r.args = args
					r.count = 0
					return r, true
				case "PUT":
					r.name = "ChannelsPut"
					r.summary = "Update Channels from Youtube"
					r.operationID = ""
					r.pathPattern = "/channels"
					r.args = args
					r.count = 0
					return r, true
				default:
					return
				}
			}
			switch elem[0] {
			case '/': // Prefix: "/"
				if l := len("/"); len(elem) >= l && elem[0:l] == "/" {
					elem = elem[l:]
				} else {
					break
				}

				// Param: "channel_id"
				// Match until "/"
				idx := strings.IndexByte(elem, '/')
				if idx < 0 {
					idx = len(elem)
				}
				args[0] = elem[:idx]
				elem = elem[idx:]

				if len(elem) == 0 {
					break
				}
				switch elem[0] {
				case '/': // Prefix: "/videos"
					if l := len("/videos"); len(elem) >= l && elem[0:l] == "/videos" {
						elem = elem[l:]
					} else {
						break
					}

					if len(elem) == 0 {
						switch method {
						case "GET":
							// Leaf: ChannelsChannelIDVideosGet
							r.name = "ChannelsChannelIDVideosGet"
							r.summary = "Get all videos for a specific channel"
							r.operationID = ""
							r.pathPattern = "/channels/{channel_id}/videos"
							r.args = args
							r.count = 1
							return r, true
						case "POST":
							// Leaf: ChannelsChannelIDVideosPost
							r.name = "ChannelsChannelIDVideosPost"
							r.summary = "Create videos for a specific channel"
							r.operationID = ""
							r.pathPattern = "/channels/{channel_id}/videos"
							r.args = args
							r.count = 1
							return r, true
						case "PUT":
							// Leaf: ChannelsChannelIDVideosPut
							r.name = "ChannelsChannelIDVideosPut"
							r.summary = "Update videos for a specific channel"
							r.operationID = ""
							r.pathPattern = "/channels/{channel_id}/videos"
							r.args = args
							r.count = 1
							return r, true
						default:
							return
						}
					}
				}
			}
		}
	}
	return r, false
}
