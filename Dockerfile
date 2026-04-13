FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p public/uploads

HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000
CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0"]
