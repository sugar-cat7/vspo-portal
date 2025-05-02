# @vspo-lab/logging

Logging utilities for Vspo Portal services.

## Installation

```bash
pnpm add @vspo-lab/logging
```

## Usage

```typescript
import { logger } from '@vspo-lab/logging';

// Example usage
logger.info('Application started');
logger.error('An error occurred', { error: new Error('Details') });
```

## Development

```bash
# Build the package
pnpm build
```

## Version

Current version: 0.1.0 