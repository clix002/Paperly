#!/bin/bash
set -e

echo "==> Pulling latest changes..."
git pull origin main

echo "==> Building and starting services..."
docker compose --env-file .env up -d --build

echo "==> Running DB migrations..."
docker compose --env-file .env exec api bun run db:migrate

echo "==> Done! Services running:"
docker compose ps
