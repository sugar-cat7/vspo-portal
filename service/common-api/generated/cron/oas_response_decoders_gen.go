// Code generated by ogen, DO NOT EDIT.

package api

import (
	"io"
	"mime"
	"net/http"

	"github.com/go-faster/errors"
	"github.com/go-faster/jx"

	"github.com/ogen-go/ogen/ogenerrors"
	"github.com/ogen-go/ogen/validate"
)

func decodeChannelsChannelIDVideosPostResponse(resp *http.Response) (res ChannelsChannelIDVideosPostRes, _ error) {
	switch resp.StatusCode {
	case 200:
		// Code 200.
		ct, _, err := mime.ParseMediaType(resp.Header.Get("Content-Type"))
		if err != nil {
			return res, errors.Wrap(err, "parse media type")
		}
		switch {
		case ct == "application/json":
			buf, err := io.ReadAll(resp.Body)
			if err != nil {
				return res, err
			}
			d := jx.DecodeBytes(buf)

			var response ChannelsChannelIDVideosPostOKApplicationJSON
			if err := func() error {
				if err := response.Decode(d); err != nil {
					return err
				}
				if err := d.Skip(); err != io.EOF {
					return errors.New("unexpected trailing data")
				}
				return nil
			}(); err != nil {
				err = &ogenerrors.DecodeBodyError{
					ContentType: ct,
					Body:        buf,
					Err:         err,
				}
				return res, err
			}
			return &response, nil
		default:
			return res, validate.InvalidContentType(ct)
		}
	case 400:
		// Code 400.
		return &ChannelsChannelIDVideosPostBadRequest{}, nil
	case 401:
		// Code 401.
		return &ChannelsChannelIDVideosPostUnauthorized{}, nil
	case 403:
		// Code 403.
		return &ChannelsChannelIDVideosPostForbidden{}, nil
	case 404:
		// Code 404.
		return &ChannelsChannelIDVideosPostNotFound{}, nil
	case 500:
		// Code 500.
		return &ChannelsChannelIDVideosPostInternalServerError{}, nil
	}
	return res, validate.UnexpectedStatusCode(resp.StatusCode)
}

func decodeChannelsChannelIDVideosPutResponse(resp *http.Response) (res ChannelsChannelIDVideosPutRes, _ error) {
	switch resp.StatusCode {
	case 200:
		// Code 200.
		ct, _, err := mime.ParseMediaType(resp.Header.Get("Content-Type"))
		if err != nil {
			return res, errors.Wrap(err, "parse media type")
		}
		switch {
		case ct == "application/json":
			buf, err := io.ReadAll(resp.Body)
			if err != nil {
				return res, err
			}
			d := jx.DecodeBytes(buf)

			var response ChannelsChannelIDVideosPutOKApplicationJSON
			if err := func() error {
				if err := response.Decode(d); err != nil {
					return err
				}
				if err := d.Skip(); err != io.EOF {
					return errors.New("unexpected trailing data")
				}
				return nil
			}(); err != nil {
				err = &ogenerrors.DecodeBodyError{
					ContentType: ct,
					Body:        buf,
					Err:         err,
				}
				return res, err
			}
			return &response, nil
		default:
			return res, validate.InvalidContentType(ct)
		}
	case 400:
		// Code 400.
		return &ChannelsChannelIDVideosPutBadRequest{}, nil
	case 401:
		// Code 401.
		return &ChannelsChannelIDVideosPutUnauthorized{}, nil
	case 403:
		// Code 403.
		return &ChannelsChannelIDVideosPutForbidden{}, nil
	case 404:
		// Code 404.
		return &ChannelsChannelIDVideosPutNotFound{}, nil
	case 500:
		// Code 500.
		return &ChannelsChannelIDVideosPutInternalServerError{}, nil
	}
	return res, validate.UnexpectedStatusCode(resp.StatusCode)
}

func decodeChannelsPostResponse(resp *http.Response) (res ChannelsPostRes, _ error) {
	switch resp.StatusCode {
	case 200:
		// Code 200.
		ct, _, err := mime.ParseMediaType(resp.Header.Get("Content-Type"))
		if err != nil {
			return res, errors.Wrap(err, "parse media type")
		}
		switch {
		case ct == "application/json":
			buf, err := io.ReadAll(resp.Body)
			if err != nil {
				return res, err
			}
			d := jx.DecodeBytes(buf)

			var response ChannelsPostOKApplicationJSON
			if err := func() error {
				if err := response.Decode(d); err != nil {
					return err
				}
				if err := d.Skip(); err != io.EOF {
					return errors.New("unexpected trailing data")
				}
				return nil
			}(); err != nil {
				err = &ogenerrors.DecodeBodyError{
					ContentType: ct,
					Body:        buf,
					Err:         err,
				}
				return res, err
			}
			return &response, nil
		default:
			return res, validate.InvalidContentType(ct)
		}
	case 400:
		// Code 400.
		return &ChannelsPostBadRequest{}, nil
	case 401:
		// Code 401.
		return &ChannelsPostUnauthorized{}, nil
	case 403:
		// Code 403.
		return &ChannelsPostForbidden{}, nil
	case 404:
		// Code 404.
		return &ChannelsPostNotFound{}, nil
	case 500:
		// Code 500.
		return &ChannelsPostInternalServerError{}, nil
	}
	return res, validate.UnexpectedStatusCode(resp.StatusCode)
}

func decodeChannelsPutResponse(resp *http.Response) (res ChannelsPutRes, _ error) {
	switch resp.StatusCode {
	case 200:
		// Code 200.
		ct, _, err := mime.ParseMediaType(resp.Header.Get("Content-Type"))
		if err != nil {
			return res, errors.Wrap(err, "parse media type")
		}
		switch {
		case ct == "application/json":
			buf, err := io.ReadAll(resp.Body)
			if err != nil {
				return res, err
			}
			d := jx.DecodeBytes(buf)

			var response ChannelsPutOKApplicationJSON
			if err := func() error {
				if err := response.Decode(d); err != nil {
					return err
				}
				if err := d.Skip(); err != io.EOF {
					return errors.New("unexpected trailing data")
				}
				return nil
			}(); err != nil {
				err = &ogenerrors.DecodeBodyError{
					ContentType: ct,
					Body:        buf,
					Err:         err,
				}
				return res, err
			}
			return &response, nil
		default:
			return res, validate.InvalidContentType(ct)
		}
	case 400:
		// Code 400.
		return &ChannelsPutBadRequest{}, nil
	case 401:
		// Code 401.
		return &ChannelsPutUnauthorized{}, nil
	case 403:
		// Code 403.
		return &ChannelsPutForbidden{}, nil
	case 404:
		// Code 404.
		return &ChannelsPutNotFound{}, nil
	case 500:
		// Code 500.
		return &ChannelsPutInternalServerError{}, nil
	}
	return res, validate.UnexpectedStatusCode(resp.StatusCode)
}
