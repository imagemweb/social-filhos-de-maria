# Checklist — Novo Projeto do Zero

## Fase 1: Repositório e Stack

- [ ] Criar repositório no GitHub (organização: imagemweb)
- [ ] Clonar template base (`git clone git@github.com:imagemweb/imagemweb-site.git NOVO-REPO`)
- [ ] Atualizar `package.json` (name, description)
- [ ] Criar `.env.local` com DATABASE_URL e JWT_SECRET locais
- [ ] Criar banco local: `createdb NOME_BANCO`
- [ ] Rodar migrations: `npx prisma migrate dev`
- [ ] Criar admin local: `POST http://localhost:3000/api/auth/setup`
- [ ] Testar `npm run dev` e acessar `/admin`

## Fase 2: Conteúdo e Design

- [ ] Definir paleta de cores (3 cores: primary, secondary, accent)
- [ ] Definir fontes Google (heading, body, accent)
- [ ] Configurar logo e favicon no `/admin/config`
- [ ] Criar conteúdo das seções
- [ ] Fazer upload das imagens principais
- [ ] Testar responsividade (mobile, tablet, desktop)

## Fase 3: Deploy no Coolify

### 3.1 Banco de dados
- [ ] Criar banco PostgreSQL via API Coolify (ver `coolify-deploy.md` §1)
- [ ] Anotar UUID do banco e montar DATABASE_URL

### 3.2 App
- [ ] Criar app via API Coolify (ver `coolify-deploy.md` §2)
- [ ] Anotar UUID do app

### 3.3 Env vars
- [ ] Adicionar `DATABASE_URL`
- [ ] Adicionar `JWT_SECRET` (gerado com `openssl rand -base64 32`)
- [ ] Adicionar `NODE_ENV=production`
- [ ] Adicionar `ADMIN_USERNAME` e `ADMIN_PASSWORD` (opcional — para seed automático)

### 3.4 Volume de uploads — CRÍTICO
- [ ] Configurar `custom_docker_run_options` com volume (ver `coolify-deploy.md` §4)
- [ ] Verificar que o volume está configurado ANTES do primeiro deploy

### 3.5 Deploy
- [ ] Corrigir git_repository para SSH (ver `coolify-deploy.md` §5)
- [ ] Executar deploy
- [ ] Aguardar build e verificar logs

### 3.6 Pós-deploy
- [ ] Criar admin: `POST https://DOMINIO/api/auth/setup`
- [ ] Acessar `/admin` e verificar login
- [ ] Fazer upload de imagem teste e verificar persistência após redeploy
- [ ] Configurar domínio personalizado (ver seção DNS abaixo)

## Fase 4: DNS

- [ ] Identificar provedor DNS do cliente
- [ ] Criar registro A: `subdominio A 173.249.22.64`
  - Se houver ALIAS/CNAME conflitante: deletar antes
- [ ] Aguardar propagação (5min–48h dependendo do TTL)
- [ ] Verificar SSL (Coolify provisiona Let's Encrypt automaticamente)

## Fase 5: Migrar Conteúdo do Dev para Produção

Se o conteúdo foi criado localmente e precisa ir para produção:

```bash
# 1. Exportar dados do banco local
node -e "
const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/BANCO_LOCAL' });
p.query('SELECT * FROM \"SiteData\"').then(r => {
  console.log(JSON.stringify(r.rows, null, 2));
  p.end();
});
" > site-data-export.json

# 2. Criar script de seed com os dados exportados
# (adaptar do padrão em prisma/seed.mjs)

# 3. Executar contra o banco de produção (DATABASE_URL de prod)
DATABASE_URL="postgres://..." node seed-prod.js
```

Ou usar a UI do Coolify para adicionar `DATABASE_URL` temporariamente ao `.env.local` e rodar o script localmente contra o banco remoto.

## Fase 6: Checklist Final

- [ ] Site público funcionando
- [ ] Admin funcionando (`/admin` com login)
- [ ] Imagens persistindo após redeploy
- [ ] SSL ativo (https://)
- [ ] Formulário de contato funcionando (se houver)
- [ ] Chat/WhatsApp configurado
- [ ] Google Analytics ou similar (se solicitado)
- [ ] Remover todos os endpoints de debug temporários
- [ ] Documentar no `lembrar.md` (UUID app, UUID banco, credenciais admin, volume)

---

## Rede Social / App Complexo — Considerações Extras

Para projetos além de "site institucional":

### Schema mais rico
```prisma
model User { ... }
model Post { ... }
model Comment { ... }
model Like { ... }
model Follow { ... }
```

### Auth mais robusta
- Refresh tokens
- Email de verificação
- Recuperação de senha por email

### Upload de mídia
- Considerar armazenamento externo (S3, R2 da Cloudflare) para escala
- Volume Docker funciona mas tem limite de disco da VPS

### Real-time (se necessário)
- Server-Sent Events (SSE) — simples, sem lib extra
- WebSockets — Pusher/Ably ou socket.io
- Polling — mais simples para MVP

### Performance
- Paginação nas listagens (não trazer tudo do banco)
- Cache com `unstable_cache` do Next.js
- Índices no banco para queries frequentes
