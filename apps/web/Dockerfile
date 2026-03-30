FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependencias
COPY package.json bun.lock* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# Copiar código fuente
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

# NEXT_PUBLIC_* se hornea en build time — debe venir como build arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN bun --bun next build

EXPOSE 3001

CMD ["bun", "--bun", "next", "start", "-p", "3001"]
