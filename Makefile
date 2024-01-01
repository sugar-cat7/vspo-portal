swagger-gen:
	@echo "Generating swagger files..."
	go generate service/common/api/generate.go
