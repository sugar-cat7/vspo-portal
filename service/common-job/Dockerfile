FROM golang:1.22.3-bullseye AS base
WORKDIR /project
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build stage for the application
FROM base AS build
RUN go build -o /tmp/app ./cmd/index.go

# Cron
FROM gcr.io/distroless/base-debian12 AS cron
COPY --from=build /tmp/app /usr/local/bin/app
CMD ["/usr/local/bin/app", "cron"]

# DB migration
FROM gcr.io/distroless/base-debian12 AS db-migration
COPY --from=build /tmp/app /usr/local/bin/app
CMD ["/usr/local/bin/app", "db-migration"]

# HTTP server
FROM gcr.io/distroless/base-debian12 AS http-serve
COPY --from=build /tmp/app /usr/local/bin/app
EXPOSE 8080
CMD ["/usr/local/bin/app", "http-serve"]
