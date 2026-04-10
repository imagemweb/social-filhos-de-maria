# Autenticação — JWT + bcrypt

## Visão Geral

- **JWT** gerado com `jose` (Edge-compatible, funciona em Next.js middleware)
- **Cookie HttpOnly** — não acessível via JS no browser
- **bcrypt** para hash de senhas (cost factor 12)
- **Roles:** `admin` | `editor`
- **Permissões:** array de strings por usuário (ex: `['hero', 'portfolio']`)

---

## Schema Prisma

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  role         String   @default("editor")  // admin | editor
  permissions  Json     @default("[]")       // array de seções
  createdAt    DateTime @default(now())
}
```

---

## Arquivo `src/lib/auth.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-fallback-insecure'
);
const COOKIE_NAME = 'auth-token';
const EXPIRES_IN = '7d';

export interface SessionPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,  // 7 dias em segundos
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

---

## Rota de Login

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions as string[],
    });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
```

---

## Setup do Primeiro Admin

Via API (após primeiro deploy):
```bash
curl -X POST https://DOMINIO/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"SenhaForte123@"}'
```

Retorna 403 se já existir algum usuário — garante que só funciona uma vez.

---

## Reset de Senha (emergência)

Via env var no Coolify:
1. Adicionar `RESET_ADMIN_PASSWORD=NovaSenha123@` no app
2. Adicionar `RESET_ADMIN_USERNAME=username` (opcional, default: imagemweb)
3. Fazer redeploy (seed executa no boot)
4. Remover as duas env vars
5. Fazer redeploy novamente

---

## Proteger Páginas Admin (frontend)

```typescript
// src/app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <>{children}</>;
}
```
