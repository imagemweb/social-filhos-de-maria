# Docker e Volumes Persistentes

## Problema Crítico: Imagens Perdidas

**Sintoma:** após redeploy, todas as imagens somem.

**Causa:** sem volume persistente, o Docker cria um container novo a cada deploy. 
As imagens ficavam na camada efêmera do container anterior — que é destruída.

**Solução:** montar um volume nomeado no path de uploads:
```
--mount type=volume,src=CLIENTE-uploads,dst=/app/public/uploads
```

---

## Dockerfile (Multi-stage)

```dockerfile
# Stage 1: dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: runtime (imagem final enxuta)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY start.sh ./
RUN chmod +x start.sh

# Criar diretório de uploads (será sobrescrito pelo volume)
RUN mkdir -p public/uploads

EXPOSE 3000
CMD ["./start.sh"]
```

---

## start.sh

Script executado no boot do container — aplica migrations, seed, e inicia Next.js:

```sh
#!/bin/sh

echo "=== BOOT START ==="
echo "NODE_ENV=$NODE_ENV"
echo "DATABASE_URL_SET=$([ -n "$DATABASE_URL" ] && echo YES || echo NO)"
echo "JWT_SECRET_SET=$([ -n "$JWT_SECRET" ] && echo YES || echo NO)"

echo "==> Aplicando migrações do banco de dados..."
timeout 30 ./node_modules/.bin/prisma migrate deploy && \
  echo "==> Migrações OK" || \
  echo "==> AVISO: migrate falhou/timeout (cod=$?)"

echo "==> Seed..."
timeout 10 node prisma/seed.mjs || true

echo "==> Fixing upload directory permissions..."
chmod -R 777 public/uploads 2>/dev/null || true
mkdir -p public/uploads && chmod 777 public/uploads
echo "==> Uploads dir: $(ls public/uploads 2>/dev/null | wc -l) arquivo(s)"
ls public/uploads 2>/dev/null | head -5 || true

echo "==> Starting Next.js..."
exec ./node_modules/.bin/next start
```

**Por que `|| true` no seed?** — Impede que falha no seed derrube o container. 
O app funciona sem seed (exceto que não terá admin inicial).

---

## docker-compose.yml (para dev local ou VPS sem Coolify)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=${NODE_ENV:-production}
    volumes:
      - uploads:/app/public/uploads

volumes:
  uploads:
    name: ${UPLOADS_VOLUME:-app-uploads}
    external: false
```

---

## Volume no Coolify — como configurar

Via API (passo obrigatório ao criar novo cliente):
```bash
curl -X PATCH "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID" \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"custom_docker_run_options":"--mount type=volume,src=CLIENTE-uploads,dst=/app/public/uploads"}'
```

Via UI do Coolify:
- App → Settings → Advanced → Custom Docker Run Options
- Colar: `--mount type=volume,src=CLIENTE-uploads,dst=/app/public/uploads`

**Verificar se o volume está montado:**
- Fazer upload de uma imagem via /admin
- Fazer redeploy
- Verificar se a imagem ainda aparece

---

## seed.mjs — Criação do Admin Inicial

```javascript
// prisma/seed.mjs
// Cria admin inicial se não existe nenhum usuário
// Suporta RESET_ADMIN_PASSWORD para emergências

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Modo emergência: resetar senha
    const resetPassword = process.env.RESET_ADMIN_PASSWORD;
    if (resetPassword) {
      const hash = await bcrypt.hash(resetPassword, 12);
      const resetUser = process.env.RESET_ADMIN_USERNAME || 'admin';
      const { rowCount } = await client.query(
        `UPDATE "User" SET "passwordHash" = $1 WHERE username = $2`,
        [hash, resetUser]
      );
      if (rowCount > 0) {
        console.log(`Senha do admin "${resetUser}" resetada.`);
      } else {
        // criar usuário se não existe
        await client.query(
          `INSERT INTO "User" (id, username, "passwordHash", role, permissions, "createdAt")
           VALUES ($1, $2, $3, 'admin', '{}', NOW())`,
          [`seed_${Date.now()}`, resetUser, hash]
        );
      }
      return;
    }

    // Criar admin inicial (só se DB vazio)
    const { rows } = await client.query('SELECT id FROM "User" LIMIT 1');
    if (rows.length > 0) return;  // já existe, pular

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO "User" (id, username, "passwordHash", role, permissions, "createdAt")
       VALUES ($1, $2, $3, 'admin', '{}', NOW())`,
      [`seed_${Date.now()}`, username, hash]
    );
    console.log(`Admin criado: ${username}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error('Seed error:', e.message); process.exit(0); });
```

---

## Diagnóstico de Problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Imagens somem após redeploy | Volume não montado | Configurar `custom_docker_run_options` |
| `public/uploads` vazio | Volume novo, nunca teve arquivos | Normal — fazer uploads via /admin |
| `ENOENT` ao salvar upload | Diretório não existe | `mkdir -p public/uploads` no start.sh |
| `EACCES` ao salvar upload | Sem permissão no diretório | `chmod 777 public/uploads` no start.sh |
| Banco não conecta | DATABASE_URL errada | Verificar env vars no Coolify |
| Migration falha | Banco não está pronto | Aumentar timeout no start.sh |
