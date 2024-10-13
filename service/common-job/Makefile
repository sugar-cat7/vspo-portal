DIR ?= infra/database/schema/migration
DRIVER ?= postgres
MIGRATION_IMAGE_NAME ?= migration-image
DBSTRING ?= host=vspo-db user=user password=password dbname=vspo sslmode=disable

.PHONY: ogen local local-build migrate sqlc ddl gen.mock lint

ogen:
	@echo "Generating swagger files..."
	rm -rf ./infra/http/cron/internal/gen
	go generate ./tool/generate.go

local:
	@echo "Setting up local database..."
	docker-compose -f ./local/compose.local.yml up
	@echo "Setting up local database...done"

local-build:
	@echo "Setting up local database..."
	docker-compose -f ./local/compose.local.yml up --build
	@echo "Setting up local database...done"

migrate:
	@echo "Migrating database..."
	go run cmd/index.go db-migration
	@echo "Migrating database...done"

ddl:
	@echo "Building Docker image first..."
	docker build -f ./Dockerfile --target db-migration -t $(MIGRATION_IMAGE_NAME) .
	@echo "Creating new migration..."
	docker run --rm -v ${PWD}/${DIR}:/migrations $(MIGRATION_IMAGE_NAME) goose -dir=/migrations create add sql
	@echo "Creating new migration done."

gen.mock:
	@echo "Generating mocks..."
	go generate ./...
	@echo "Generating mocks...done"

lint:
	@echo "Linting..."
	docker run -t --rm -v $(PWD):/app -w /app golangci/golangci-lint:v1.61.0 golangci-lint run -v
	@echo "Linting...done"
