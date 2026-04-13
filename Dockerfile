FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p public/uploads

EXPOSE 4000
CMD ["node", "-e", "const h=require('http');h.createServer((_,r)=>r.end('ALIVE ON 4000')).listen(4000,'0.0.0.0',()=>console.log('ok 4000'));setInterval(()=>{},60000)"]
