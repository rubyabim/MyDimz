import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  engine: 'classic',
  datasource: {
    provider: 'postgresql',
    url: env('DATABASE_URL'),
  },
});
