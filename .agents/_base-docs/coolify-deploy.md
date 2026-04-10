# Guia de Deploy — Coolify

## Credenciais e Referências

- **URL Coolify:** https://coolify.novoagente.ia.br
- **API Key:** `3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed`
- **IP do servidor VPS:** `173.249.22.64`
- **Server UUID:** `b0080wwos4g40w0o0ks48k8c`
- **Project UUID:** `cssco08sok8sccsgwkkgcgwg` (projeto: imagemweb)
- **Environment:** production (ID: 1)
- **Deploy key GitHub UUID:** `t64f4y37p1khxqavgecpz6xt` (nome: deploy-imagemweb-site)

---

## Passo a Passo — Novo Cliente

### 1. Criar banco PostgreSQL

```bash
curl -s -X POST https://coolify.novoagente.ia.br/api/v1/databases/postgresql \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{
    "server_uuid": "b0080wwos4g40w0o0ks48k8c",
    "project_uuid": "cssco08sok8sccsgwkkgcgwg",
    "environment_name": "production",
    "name": "CLIENTE-db",
    "postgres_db": "CLIENTE",
    "postgres_user": "CLIENTE",
    "postgres_password": "SENHA_ALEATORIA",
    "is_public": false,
    "instant_deploy": true
  }'
```

Retorna `uuid` do banco. Montar DATABASE_URL:
```
postgres://USUARIO:SENHA@DB_UUID:5432/BANCO
```

### 2. Criar app

```bash
curl -s -X POST https://coolify.novoagente.ia.br/api/v1/applications/private-deploy-key \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{
    "server_uuid": "b0080wwos4g40w0o0ks48k8c",
    "project_uuid": "cssco08sok8sccsgwkkgcgwg",
    "environment_name": "production",
    "private_key_uuid": "t64f4y37p1khxqavgecpz6xt",
    "git_repository": "git@github.com:imagemweb/REPO.git",
    "git_branch": "master",
    "build_pack": "dockerfile",
    "name": "CLIENTE",
    "domains": "https://DOMINIO_DO_CLIENTE",
    "ports_exposes": "3000",
    "instant_deploy": false
  }'
```

Retorna `uuid` do app.

### 3. Adicionar env vars

```bash
# DATABASE_URL
curl -X POST "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID/envs" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"key":"DATABASE_URL","value":"postgres://..."}'

# JWT_SECRET (gerar com: openssl rand -base64 32)
curl -X POST "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID/envs" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"key":"JWT_SECRET","value":"VALOR_GERADO"}'

# NODE_ENV
curl -X POST "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID/envs" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"key":"NODE_ENV","value":"production"}'
```

### 4. Volume de uploads (persistente)

**CRÍTICO**: Sem isso, imagens somem a cada redeploy.

```bash
curl -X PATCH "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"custom_docker_run_options":"--mount type=volume,src=CLIENTE-uploads,dst=/app/public/uploads"}'
```

### 5. Corrigir URL SSH e fazer deploy

```bash
# Fix git_repository (garante SSH)
curl -X PATCH "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"git_repository":"git@github.com:imagemweb/REPO.git"}'

# Deploy
curl -X POST "https://coolify.novoagente.ia.br/api/v1/deploy?uuid=APP_UUID&force=false" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed"
```

### 6. Criar admin inicial

Após o primeiro deploy, acessar:
```
POST https://DOMINIO/api/auth/setup
Body: { "username": "admin", "password": "SenhaForte123@" }
```

Funciona apenas uma vez (retorna 403 se já houver usuário).

### 7. DNS

- **A record** (preferido): `subdominio A 173.249.22.64`
- **CNAME** (CDN bloqueado): `subdominio CNAME coolify.novoagente.ia.br`

> **Atenção Hostinger**: Se houver registro ALIAS para o subdomínio, deletar antes de criar A record. O CDN da Hostinger conflita com A records.

---

## Operações Úteis

### Listar env vars de um app
```bash
curl "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID/envs" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed"
```

### Atualizar env var
```bash
curl -X PATCH "https://coolify.novoagente.ia.br/api/v1/applications/APP_UUID/envs/ENV_UUID" \
  -H "Authorization: Bearer 3|UW2bC2Udm2zYlJfdmmatGcGyoTuUA3w1cCh2vEx1968203ed" \
  -H "Content-Type: application/json" \
  -d '{"key":"NOME","value":"NOVO_VALOR"}'
```

### Reset de senha do admin (via seed)
1. Adicionar env var `RESET_ADMIN_PASSWORD` com a nova senha
2. Fazer redeploy (seed executa automaticamente no boot)
3. Remover env var `RESET_ADMIN_PASSWORD`
4. Fazer redeploy novamente

### Ver logs do app
Na UI do Coolify: App → Logs → View

---

## Clientes Ativos

| Cliente | Domínio | App UUID | DB UUID | Volume |
|---|---|---|---|---|
| Doglly | doglly.danesalimentos.com.br | `po1mlllc9j8o0nbbnv8dzy00` | — | `doglly-uploads` |
| APAE 60 Anos | 60anos.apaeapucarana.com.br | `k10chztxhi9r0eodwqewbc5g` | `wak9jxwvvm5qcuosnf61q4al` | `apae60anos-uploads` |
| Santo Expedito | santoexpedito.pnsaparecida.com.br | `qq0smpeletlkfthf5n89dacf` | `vqje87o8t8en4tefelc36e2e` | `santoexpedito-uploads` |
| Teste/Demo | teste1.imagemweb.com.br | `hu24m9h1wyu0gyosw83gft6m` | `cftu5su12hbh8yx16izow1ju` | `teste1-uploads` |
