DIR ?= ./infra/database/internal/schema/migration
DRIVER ?= postgres
MIGRATION_IMAGE_NAME ?= migration-image
DBSTRING ?= host=vspo-db user=user password=password dbname=vspo sslmode=disable
ogen:
	@echo "Generating swagger files..."
	rm -rf ./infra/http/cron/internal/gen
	go generate service/cron/tool/generate.go
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
	@ docker run --rm -v ${PWD}/${DIR}:/migrations $(MIGRATION_IMAGE_NAME) goose -dir=/migrations postgres "${DBSTRING}" up
	goose -dir=${DIR} ${DRIVER} "${DBSTRING}" up
	@echo "Migrating database...done"
sqlc:
	@echo "Pulling sqlc/sqlc Docker image..."
	docker pull sqlc/sqlc
	@echo "Removing old generated files..."
	rm -rf ./infra/database/internal/gen
	@echo "Generating sqlc files..."
	docker run --rm -v $$(pwd):/src -w /src sqlc/sqlc generate
ddl:
	@echo "Building Docker image first..."
	docker build -f ./Dockerfile.migration -t $(MIGRATION_IMAGE_NAME) .
	@echo "Creating new migration..."
	docker run --rm -v ${PWD}/${DIR}:/migrations $(MIGRATION_IMAGE_NAME) goose -dir=/migrations create $(name) sql
	@echo "Creating new migration done."
gen.mock:
	@echo "Generating mocks..."
	go generate ./...
	@echo "Generating mocks...done"
