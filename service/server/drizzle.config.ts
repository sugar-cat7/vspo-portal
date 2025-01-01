import { defineConfig } from "drizzle-kit";


export default defineConfig({
  schema: "./infra/repository/schema/index.ts",
  out: "./infra/repository/schema/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/vspo",
  },
  migrations: {
    table: 'migrations',
    schema: "public",
  }
});
