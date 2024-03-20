DIR ?= ./service/common-api/schema/migration
DRIVER ?= postgres
DBSTRING ?= host=localhost user=user password=password dbname=vspo sslmode=disable
ogen:
	@echo "Generating swagger files..."
	rm -rf ./service/common-api/generated
	go generate service/common-api/tool/generate.go
ddl:
	@echo "Generating new ddl files..."
	goose -dir ./service/common-api/schema/migration create $(name) sql
	@echo "Generating new ddl files...done"
local:
	@echo "Setting up local database..."
	docker-compose -f ./docker/docker-compose.local.yml up
	@echo "Setting up local database...done"
migrate:
	@echo "Migrating database..."
	goose -dir=${DIR} ${DRIVER} "${DBSTRING}" up
	@echo "Migrating database...done"
sqlc:
	@echo "Generating sqlc files..."
	cd ./service/common-api && rm -rf ./infra/database/internal/db && sqlc generate
	@echo "Generating sqlc files...done"
