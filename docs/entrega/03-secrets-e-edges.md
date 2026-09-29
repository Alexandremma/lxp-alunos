# 03 — Secrets, URLs e Edge Functions

O que configurar ao publicar (homologação ou produção). **Nunca** colar senhas, service role ou chaves neste arquivo nem no Git.

## 1. Variáveis de ambiente — Vercel (fronts)

### lxp-alunos

| Variável | Para quê |
|----------|----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `VITE_ALICE_BASE_URL` / `VITE_ALICE_API_KEY` / `VITE_ALICE_API_SECRET` | Catálogo e player Alice |
| `VITE_LXP_ALUNOS_SET_PASSWORD_URL` | URL absoluta de `/definir-senha` (obrigatória em **produção**) |
| `VITE_LXP_ALUNOS_PUBLIC_ORIGIN` | Origem pública do portal (QR / validação de certificado; obrigatória em **produção**) |

### lxp-backoffice

| Variável | Para quê |
|----------|----------|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Mesmo projeto |
| `VITE_ALICE_BASE_URL` / `VITE_ALICE_API_KEY` / `VITE_ALICE_API_SECRET` | Catálogo Alice no admin (par de chaves do backoffice) |
| `VITE_BACKOFFICE_SET_PASSWORD_URL` | URL de `/admin/definir-senha` (obrigatória em produção) |
| `VITE_LXP_ALUNOS_SET_PASSWORD_URL` | Redirect de reset de senha de **alunos** disparado pelo admin |
| `VITE_LXP_ALUNOS_PUBLIC_ORIGIN` | Base do QR/validação (sempre o app **alunos**) |

Em builds de produção, a ausência das URLs de set-password / public origin **falha de propósito** (não há fallback silencioso para domínio Vercel da homolog B42).

## 2. Supabase Auth (Dashboard)

| Item | Ação na publicação |
|------|-----------------|
| Site URL | Domínio oficial do app principal (alunos ou conforme política do cliente) |
| Redirect URLs | Incluir `…/definir-senha` (alunos) e `…/admin/definir-senha` (backoffice) — homolog e prod |
| Auth Hook → Send Email | URL da Edge `auth-send-email` + secret do hook |

## 3. Secrets das Edge Functions

Dashboard → Edge Functions → Secrets. Marcar apenas após conferência humana:

| Secret | Uso |
|--------|-----|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Runtime das functions |
| `SMTP_CREDENTIALS_ENCRYPTION_KEY` | Criptografia SMTP institucional |
| `B42_SMTP_*` (host, port, user, password, from…) | Fallback de e-mail |
| `SEND_EMAIL_HOOK_SECRET` | Assinatura do Auth Hook |
| `SMTP_TEST_ALLOWLIST` | Opcional (homolog) |
| `MAIA_API_KEY` (+ `MAIA_BASE_URL` / `MAIA_TENANT_ID` / `MAIA_TENANT_NAME` se usados) | Tutor IA |

Valores: somente no Dashboard / Vault — **nunca** no repositório.

## 4. Deploy das Edges

No diretório `lxp-backoffice` (com CLI autenticada no projeto alvo):

```bash
supabase functions deploy invite-team-member
supabase functions deploy manage-student-admin
supabase functions deploy update-smtp-settings
supabase functions deploy send-test-email
supabase functions deploy auth-send-email --no-verify-jwt
supabase functions deploy ai-tutor-chat
```

## 5. Checklist de publicação

Este passo é da equipe que publica o ambiente. A homologação B42 não é copiada para produção: use um projeto Supabase novo.

1. Criar o projeto Supabase de produção.  
2. Aplicar somente `lxp-backoffice/supabase/migrations/` (até o STEP 43), na ordem dos arquivos.  
3. Configurar secrets das Edges + Auth Hook.  
4. Atualizar Site URL e Redirect URLs.  
5. Setar envs Vercel dos dois apps (incluindo set-password e public origin).  
6. Redeploy fronts + Edges.  
7. Smoke: login, esqueci senha (aluno e equipe), convite, certificado QR, Tutor IA.

## 6. Seeds de demonstração

Os arquivos em `lxp-backoffice/supabase/seeds/` criam usuários e dados de teste. Eles **não** fazem parte das migrations e **não** entram num projeto novo que só recebe o passo 2.

Não execute esses scripts em produção. Servem para montar ou resetar um ambiente de demonstração, e só depois das migrations.
