# Padrões de API Routes — Next.js App Router

## Estrutura de uma Rota Típica

```typescript
// src/app/api/[recurso]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — público (qualquer um pode ler)
export async function GET() {
  try {
    const data = await prisma.siteData.findFirst({
      where: { key: 'recurso' },
    });
    return NextResponse.json(data?.value ?? {});
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// POST — protegido (só admin autenticado)
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    // validar body aqui se necessário

    await prisma.siteData.upsert({
      where: { key: 'recurso' },
      create: { key: 'recurso', value: body },
      update: { value: body },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
```

---

## Padrão de Armazenamento (SiteData)

O banco usa uma tabela `SiteData` com chave-valor JSON:

```prisma
model SiteData {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
}
```

Cada seção do site tem sua chave:
- `config` — logo, cores, fontes
- `hero` — slides
- `portfolio` — itens
- `destaques` — cards
- etc.

---

## Padrão de Resposta

| Situação | Status | Body |
|---|---|---|
| Sucesso com dados | 200 | `{ dados... }` |
| Sucesso sem corpo | 200 | `{ ok: true }` |
| Não autenticado | 401 | `{ error: 'Não autorizado' }` |
| Proibido (auth ok, mas sem permissão) | 403 | `{ error: 'Sem permissão.' }` |
| Validação falhou | 400 | `{ error: 'Mensagem explicativa.' }` |
| Não encontrado | 404 | `{ error: 'Não encontrado.' }` |
| Erro interno | 500 | `{ error: 'Erro interno.' }` |

---

## Upload de Arquivos

```typescript
// POST /api/upload
// FormData: file (arquivo), targetFilename? (nome desejado)
// Retorna: { url: '/uploads/nome-do-arquivo.webp' }
```

No frontend:
```typescript
import { uploadImage } from '@/lib/utils';

// uploadImage recebe File, faz compressão WebP e chama /api/upload
const url = await uploadImage(file);
// url = '/uploads/abc123.webp'
```

---

## Rotas de Auth

```
POST /api/auth/login     — { username, password } → seta cookie JWT
POST /api/auth/logout    — limpa cookie
GET  /api/auth/me        — retorna { username, role, permissions } ou 401
POST /api/auth/setup     — cria primeiro admin (retorna 403 se já existe)
```

---

## `export const dynamic = 'force-dynamic'`

Adicionar em **toda** rota que lê do banco ou acessa cookies.
Sem isso, Next.js pode fazer cache estático e retornar dados velhos.

---

## Middleware (proteção do /admin)

```typescript
// middleware.ts (na raiz src/ ou raiz do projeto)
export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // verificação do JWT aqui
}
```
