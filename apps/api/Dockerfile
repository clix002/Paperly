FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependencias del monorepo completo
COPY package.json bun.lock* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# Copiar código fuente
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
