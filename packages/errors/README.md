# @vspo-lab/error

Error handling utilities for Vspo Portal services.

## Installation

```bash
pnpm add @vspo-lab/error
```

## Usage

```typescript
import { BaseError, ErrorCode, Result } from '@vspo-lab/error';

// Example usage with Result
const result = Result.ok('success');
// or
const errorResult = Result.err(new BaseError(ErrorCode.INTERNAL_SERVER_ERROR, 'Something went wrong'));
```

## Dependencies

- zod: ^3.24.3

## Development

```bash
# Build the package
pnpm build
```

## Version

Current version: 0.1.0 