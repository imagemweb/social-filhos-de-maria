FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN mkdir -p public/uploads

RUN printf '#!/bin/sh\necho "=== START ==="\necho "DB=$([ -n "$DATABASE_URL" ] && echo OK || echo MISSING)"\ntimeout 30 ./node_modules/.bin/prisma migrate deploy || echo "migrate failed"\ntimeout 10 node prisma/seed.mjs || true\nmkdir -p public/uploads && chmod 777 public/uploads || true\nexec ./node_modules/.bin/next start\n' > /app/boot.sh && chmod +x /app/boot.sh

EXPOSE 3000
CMD ["/app/boot.sh"]
