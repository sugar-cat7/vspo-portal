.PHONY: sqlc

sqlc:
	@echo "Pulling sqlc/sqlc Docker image..."
	docker pull sqlc/sqlc
	@echo "Removing old generated files..."
	rm -rf ./service/common-job/infra/database/internal/gen
	rm -rf ./service/common-api-server/pkg/db/postgres/gen
	@echo "Generating sqlc files..."
	docker run --rm -v $$(pwd):/src -w /src sqlc/sqlc generate

local-dev:
	@echo "Setting up local database..."
	docker-compose -f ./docker/compose.local.yml up --build
	@echo "Setting up local database...done"