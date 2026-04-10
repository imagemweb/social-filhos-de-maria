# Práticas de Segurança

## 1. Variáveis de Ambiente

**Nunca commitar no git:**
- `DATABASE_URL`
- `JWT_SECRET`
- Qualquer senha, API key, ou token

**Arquivo `.env.local`** (adicionado ao `.gitignore`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="string-aleatoria-minimo-32-chars"
```

**Gerar JWT_SECRET seguro:**
```bash
openssl rand -base64 32
```

**Em produção:** usar variáveis de ambiente do Coolify (nunca arquivo `.env` no repo).

**Manter `.env.example`** no repo com nomes das vars mas sem valores:
```env
DATABASE_URL=
JWT_SECRET=  # gere com: openssl rand -base64 32
NODE_ENV=production
```

---

## 2. Autenticação nas API Routes

**Toda rota de escrita (POST/PUT/DELETE) deve ser protegida.**

Padrão obrigatório em cada route.ts:
```typescript
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;  // 401 se não autenticado

  // ... lógica da rota
}
```

**Rotas que NÃO precisam de auth:**
- GET de dados públicos (hero, config, portfolio, etc.)
- POST `/api/auth/login`
- POST `/api/auth/setup` (retorna 403 automaticamente após primeiro uso)

---

## 3. Upload de Arquivos

**Extensões permitidas** (whitelist, nunca blacklist):
```typescript
const ALLOWED_EXTENSIONS = new Set(['jpg','jpeg','png','gif','webp','avif','svg']);
```

**Limite de tamanho:** 20MB por arquivo.

**Prevenção de path traversal:**
```typescript
const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
const dest = path.resolve(uploadDir, safeName);
if (!dest.startsWith(path.resolve(uploadDir))) {
  return NextResponse.json({ error: 'Caminho inválido.' }, { status: 400 });
}
```

**Validar MIME type** além da extensão (defense in depth).

---

## 4. JWT e Sessões

- Token armazenado em **cookie HttpOnly** (não acessível via JS do browser)
- Cookie com `SameSite=Lax` e `Secure=true` em produção
- Expiração: 7 dias por padrão
- Algoritmo: `HS256` com `jose`

**Nunca** armazenar JWT no `localStorage` — vulnerável a XSS.

---

## 5. Senhas

- Hash com **bcrypt** (cost factor 12)
- Nunca armazenar senha em texto plano, nem logar
- Mínimo 8 caracteres na criação

```typescript
const hash = await bcrypt.hash(password, 12);
```

---

## 6. Endpoints de Debug

**Nunca deixar em produção** endpoints que exponham:
- Caminhos do servidor
- Conteúdo de diretórios
- Variáveis de ambiente
- Informações de stack (stack traces completos)

Se precisar de endpoint de diagnóstico temporário, protegê-lo com `requireAuth()` e deletar após uso.

---

## 7. Erros

**Não expor detalhes internos nos erros da API:**
```typescript
// ERRADO
catch (e) {
  return NextResponse.json({ error: String(e) }, { status: 500 });
}

// CORRETO
catch {
  return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
}
```

Logar detalhes internamente (console.error) mas retornar mensagem genérica ao cliente.

---

## 8. Checklist de Segurança para Novo Projeto

- [ ] `.env.local` no `.gitignore`
- [ ] `.env.example` com nomes sem valores
- [ ] JWT_SECRET gerado com `openssl rand -base64 32`
- [ ] Todas as rotas POST/PUT/DELETE com `requireAuth()`
- [ ] Upload com whitelist de extensões e limite de tamanho
- [ ] Nenhum endpoint de debug em produção
- [ ] Erros retornam mensagem genérica (não stack trace)
- [ ] Senhas com bcrypt cost 12+
- [ ] Cookie JWT: HttpOnly, SameSite, Secure
