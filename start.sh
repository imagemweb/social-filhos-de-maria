#!/bin/sh

echo "=== BOOT START ==="
echo "NODE_ENV=$NODE_ENV"
echo "DATABASE_URL_SET=$([ -n "$DATABASE_URL" ] && echo YES || echo NO)"
echo "JWT_SECRET_SET=$([ -n "$JWT_SECRET" ] && echo YES || echo NO)"

echo "==> Aplicando migrações..."
timeout 30 ./node_modules/.bin/prisma migrate deploy && \
  echo "==> Migrações OK" || \
  echo "==> AVISO: migrate falhou (cod=$?)"

echo "==> Seed..."
timeout 10 node prisma/seed.mjs || true

echo "==> Permissões de uploads..."
mkdir -p public/uploads && chmod -R 777 public/uploads 2>/dev/null || true

echo "==> Iniciando Next.js..."
exec ./node_modules/.bin/next start
