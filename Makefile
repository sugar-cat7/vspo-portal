DIR ?= ./service/cron/infra/database/internal/schema/migration
DRIVER ?= postgres
ogen:
	@echo "Generating swagger files..."
	rm -rf ./service/cron/infra/http/cron/internal/gen
	go generate service/cron/tool/generate.go
ddl:
	@echo "Generating new ddl files..."
	docker-compose run --rm migration goose -dir=/migrations create $(name) sql
	@echo "Generating new ddl files...done"
local:
	@echo "Setting up local database..."
	docker-compose -f ./service/cron/compose.local.yml up
	@echo "Setting up local database...done"
local-build:
	@echo "Setting up local database..."
	docker-compose -f ./service/cron/compose.local.yml up --build
	@echo "Setting up local database...done"
migrate:
	@echo "Migrating database..."
	docker-compose run --rm migration goose -dir=/migrations postgres "${DBSTRING}" up
	@echo "Migrating database...done"
sqlc:
	@echo "Generating sqlc files..."
	docker-compose run --rm migration sh -c "cd /project && rm -rf ./infra/database/internal/gen && sqlc generate"
	@echo "Generating sqlc files...done"

