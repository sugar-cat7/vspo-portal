# App

## Requirements

### Runtime

- [bun](https://bun.sh/)

## Local Development Server

###A API

#### Running the Server

To start the server:

```bash
$ bun install
$ bun api
```

#### Swagger UI

Access the Swagger UI at:

- [http://localhost:8787/swagger-ui](http://localhost:8787/swagger-ui)

#### Generating Code

To generate code:

```bash
$ bun hygen:generate
```

The corresponding file will be generated under `internal`.

#### Local Database Migration

- Update the database schema at `service/api/schema/db/schema.ts` using Drizzle.
- Modify `wrangler.toml` as needed:

```
[[d1_databases]]
binding = "DB" # i.e., available in your Worker on env.DB
database_name = "test-app"
database_id = "xxx" # <- update this
```

To migrate the local database:

```bash
$ bun migrate:local
# If necessary, insert seed data
$ bun seed:local
```
