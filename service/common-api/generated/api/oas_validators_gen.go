// Code generated by ogen, DO NOT EDIT.

package api

import (
	"fmt"

	"github.com/go-faster/errors"

	"github.com/ogen-go/ogen/validate"
)

func (s CreatorsGetCreatorType) Validate() error {
	switch s {
	case "vspo":
		return nil
	default:
		return errors.Errorf("invalid value: %v", s)
	}
}

func (s *VideoResponse) Validate() error {
	if s == nil {
		return validate.ErrNilPointer
	}

	var failures []validate.FieldError
	if err := func() error {
		if value, ok := s.Platform.Get(); ok {
			if err := func() error {
				if err := value.Validate(); err != nil {
					return err
				}
				return nil
			}(); err != nil {
				return err
			}
		}
		return nil
	}(); err != nil {
		failures = append(failures, validate.FieldError{
			Name:  "platform",
			Error: err,
		})
	}
	if len(failures) > 0 {
		return &validate.Error{Fields: failures}
	}
	return nil
}

func (s VideoResponsePlatform) Validate() error {
	switch s {
	case "youtube":
		return nil
	case "twitch":
		return nil
	case "twitcasting":
		return nil
	case "niconico":
		return nil
	case "unknown":
		return nil
	default:
		return errors.Errorf("invalid value: %v", s)
	}
}

func (s VideosGetPeriod) Validate() error {
	switch s {
	case "day":
		return nil
	case "month":
		return nil
	case "week":
		return nil
	default:
		return errors.Errorf("invalid value: %v", s)
	}
}

func (s VideosGetSort) Validate() error {
	switch s {
	case "time":
		return nil
	case "trending":
		return nil
	case "views":
		return nil
	default:
		return errors.Errorf("invalid value: %v", s)
	}
}

func (s *VideosResponse) Validate() error {
	if s == nil {
		return validate.ErrNilPointer
	}

	var failures []validate.FieldError
	if err := func() error {
		var failures []validate.FieldError
		for i, elem := range s.Videos {
			if err := func() error {
				if err := elem.Validate(); err != nil {
					return err
				}
				return nil
			}(); err != nil {
				failures = append(failures, validate.FieldError{
					Name:  fmt.Sprintf("[%d]", i),
					Error: err,
				})
			}
		}
		if len(failures) > 0 {
			return &validate.Error{Fields: failures}
		}
		return nil
	}(); err != nil {
		failures = append(failures, validate.FieldError{
			Name:  "videos",
			Error: err,
		})
	}
	if len(failures) > 0 {
		return &validate.Error{Fields: failures}
	}
	return nil
}
