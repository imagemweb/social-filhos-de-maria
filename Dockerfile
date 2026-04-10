# ---- Stage 1: dependências de produção ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ---- Stage 2: build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY package*.json ./

RUN mkdir -p public/uploads

# Gerar start.sh inline (garante LF independente do SO do host)
RUN printf '#!/bin/sh\n\
echo "=== BOOT START ==="\n\
echo "NODE_ENV=$NODE_ENV"\n\
echo "DB=$([ -n "$DATABASE_URL" ] && echo OK || echo MISSING)"\n\
echo "JWT=$([ -n "$JWT_SECRET" ] && echo OK || echo MISSING)"\n\
echo "==> Migrations..."\n\
timeout 30 ./node_modules/.bin/prisma migrate deploy || echo "migrate failed"\n\
echo "==> Seed..."\n\
timeout 10 node prisma/seed.mjs || true\n\
echo "==> Uploads dir..."\n\
mkdir -p public/uploads && chmod -R 777 public/uploads || true\n\
echo "==> Starting Next.js..."\n\
exec ./node_modules/.bin/next start\n' > start.sh && chmod +x start.sh

EXPOSE 3000
CMD ["./start.sh"]
