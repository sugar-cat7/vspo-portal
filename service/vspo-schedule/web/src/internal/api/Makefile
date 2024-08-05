.PHONY: sqlc

sqlc:
	@echo "Pulling sqlc/sqlc Docker image..."
	docker pull sqlc/sqlc
	@echo "Removing old generated files..."
	rm -rf ./pkg/db/gen/sqlc/pg
	@echo "Generating sqlc files..."
	docker run --rm -v $$(pwd):/src -w /src sqlc/sqlc generate
