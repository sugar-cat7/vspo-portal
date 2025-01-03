import { defineConfig } from "drizzle-kit";


export default defineConfig({
  schema: "./infra/repository/schema/index.ts",
  out: "../shared/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
