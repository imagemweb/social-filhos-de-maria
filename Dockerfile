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
CMD ["node", "-e", "require('http').createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/plain'});res.end('OK - container is alive\\n');}).listen(3000,'0.0.0.0',()=>console.log('Test server on 3000'))"]
