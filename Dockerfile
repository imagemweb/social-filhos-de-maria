FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p public/uploads

COPY entrypoint-debug.sh /entrypoint-debug.sh
RUN chmod +x /entrypoint-debug.sh

EXPOSE 3000
CMD ["/entrypoint-debug.sh"]
