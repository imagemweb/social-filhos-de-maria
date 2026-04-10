# Stack Técnica

## Tecnologias

| Camada | Tecnologia | Versão | Por quê |
|---|---|---|---|
| Framework | Next.js | 16 (App Router) | SSR/SSG, API Routes integradas, deploy Docker |
| UI | React | 19 | Estável, ecossistema maduro |
| Tipagem | TypeScript | 5 | Obrigatório para escala |
| Estilo | Tailwind CSS | v4 | Utility-first, sem CSS separado |
| ORM | Prisma | 7 | Type-safe, migrations automáticas |
| Banco | PostgreSQL | 16 | Confiável, suportado pelo Coolify |
| Auth | jose + bcryptjs | — | JWT stateless, bcrypt para senhas |
| Runtime | Node.js | 20 LTS | Compatível com Next.js 16 |
| Container | Docker | multi-stage | Build otimizado (~200MB final) |
| Deploy | Coolify | auto-hospedado | Controle total, sem custo por app |

## Estrutura de Diretórios

```
src/
  app/
    page.tsx              # Página pública (cliente final vê)
    layout.tsx            # Root layout (config, fontes, chat widget)
    admin/
      layout.tsx          # Layout do painel admin (sidebar, auth guard)
      page.tsx            # Dashboard
      [secao]/page.tsx    # Cada seção editável tem sua página
    api/
      auth/
        login/route.ts    # POST — gera JWT
        logout/route.ts   # POST — limpa cookie
        me/route.ts       # GET — retorna sessão atual
        setup/route.ts    # POST — cria primeiro admin (uma vez só)
      [secao]/route.ts    # GET (público) + POST (protegido)
      upload/route.ts     # POST (protegido) — salva imagem
  lib/
    prisma.ts             # Singleton do cliente Prisma
    auth.ts               # getSession(), requireAuth(), signToken()
    storage.ts            # Leitura/escrita dos dados via Prisma
    types.ts              # Todas as interfaces TypeScript
    utils.ts              # getYouTubeId, compressImage, uploadImage
  components/
    [Secao]Section.tsx    # Componente público de cada seção
prisma/
  schema.prisma           # Schema do banco
  migrations/             # Histórico de migrations
  seed.mjs                # Seed inicial (cria admin, suporta RESET_ADMIN_PASSWORD)
public/
  uploads/                # Imagens enviadas (volume Docker persistente)
```

## Convenções

- **Dados do site** ficam em uma única tabela `SiteData` (JSON), não em múltiplas tabelas — simplifica o schema para sites com conteúdo moderado
- **API Routes** sempre: GET público, POST protegido com `requireAuth()`
- **Uploads** sempre para `public/uploads/` via `/api/upload`, nunca base64 no banco
- **Env vars** sensíveis NUNCA no git — usar `.env.local` (dev) e Coolify UI (prod)
- **Admin** em `/admin/*` — protegido por middleware JWT

## Comandos de Desenvolvimento

```bash
npm run dev          # Dev server (Turbopack, porta 3000)
npm run build        # Build de produção
npm run start        # Servidor de produção
npx prisma migrate dev --name nome   # Nova migration
npx prisma studio    # UI visual do banco
```

## Banco de Dados Local (dev)

Criar `.env.local` na raiz:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/NOME_DO_BANCO"
JWT_SECRET="dev-local-secret-32chars-change-in-prod-abc123xyz"
```

Criar banco:
```bash
createdb NOME_DO_BANCO  # ou via pgAdmin
npx prisma migrate dev
```
