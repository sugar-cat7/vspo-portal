# @vspo-lab/api

API client package for interacting with Vspo Portal backend services.

## Installation

```bash
pnpm add @vspo-lab/api
```

## Usage

```typescript
import { apiClient } from '@vspo-lab/api';

// Example usage
const response = await apiClient.someEndpoint();
```

## Dependencies

- @vspo-lab/error: workspace package
- axios: ^1.9.0
- axios-retry: ^4.5.0

## Development

```bash
# Build the package
pnpm build

# Generate OpenAPI types
pnpm generate-openapi
```

## Version

Current version: 0.1.0 