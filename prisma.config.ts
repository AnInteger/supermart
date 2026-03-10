import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// 加载环境变量（按优先级：.env.local > .env）
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
