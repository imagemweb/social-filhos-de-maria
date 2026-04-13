FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p public/uploads

EXPOSE 3000
CMD ["sh", "-c", "npm start 2>&1; echo '=== EXIT CODE: '$?; sleep 7200"]
