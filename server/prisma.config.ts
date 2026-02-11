import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    provider: "sqlite",
    url: process.env["DATABASE_URL"],
    adapter: {
      name: "@prisma/adapter-better-sqlite3",
      url: process.env["DATABASE_URL"],
    },
  },
});
