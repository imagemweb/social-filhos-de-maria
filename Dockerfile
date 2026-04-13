FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN ./node_modules/.bin/prisma generate
RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p public/uploads

# Cria entrypoint com LF garantido
RUN printf '#!/bin/sh\nLOG=/tmp/app.log\n./node_modules/.bin/next start -H 0.0.0.0 > $LOG 2>&1 &\nNEXT_PID=$!\nsleep 8\nnode -e "const fs=require('"'"'fs'"'"');const http=require('"'"'http'"'"');http.createServer((req,res)=>{res.writeHead(200,{'"'"'Content-Type'"'"':'"'"'text/plain'"'"'});try{res.end(fs.readFileSync('"'"'/tmp/app.log'"'"','"'"'utf8'"'"')||'"'"'empty'"'"');}catch(e){res.end('"'"'err:'"'"'+e.message);}}).listen(3000,'"'"'0.0.0.0'"'"',()=>{});" &\nwait $NEXT_PID\necho "EXIT:$?" >> $LOG\nsleep 600\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
