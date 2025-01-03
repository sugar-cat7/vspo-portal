# API Server

## Available Commands

### Start Dev Server
Starts the development environment using Docker and Wrangler.

```
pnpm run dev
```

### Start Remote Dev Server (Without Queue Binding)
Runs the server in a remote environment without queue binding.

```
pnpm run dev:remote
```

### Deploy to Production
Deploys the application to the production environment.

```
pnpm run deploy
```

### Generate DDL
Generates database DDL using drizzle-kit.

```
pnpm run db:generate
```

### Apply Local Migrations
Applies local database migrations.

```
pnpm run db:migrate:local
```

