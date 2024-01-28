DIR ?= ./service/common-api/schema/migrations
DRIVER ?= postgres
DBSTRING ?= host=localhost user=user password=password dbname=vspo sslmode=disable
ogen:
	@echo "Generating swagger files..."
	go generate service/common-api/tool/generate.go
ddl:
	@echo "Generating new ddl files..."
	goose -dir ./service/common-api/schema/migrations create $(name) sql
	@echo "Generating new ddl files...done"
local-db-setup:
	@echo "Setting up local database..."
	docker-compose -f ./docker/docker-compose.local.yml up -d
	@echo "Setting up local database...done"
migrate:
	@echo "Migrating database..."
	goose -dir=${DIR} ${DRIVER} "${DBSTRING}" up
	@echo "Migrating database...done"
sqlc:
	@echo "Generating sqlc files..."
	cd ./service/common-api && sqlc generate
	@echo "Generating sqlc files...done"
