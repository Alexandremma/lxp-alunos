# 01 — Visão geral do LXP

**Produto:** plataforma de aprendizagem (LXP) da B42 Edtech.  
**Composição:** dois apps web independentes + um projeto Supabase (banco, Auth, Storage, Edge Functions).

## Em uma frase

Alunos estudam em jornada gamificada (conteúdo Alice); a equipe administra cursos, pessoas, regras de XP, certificados e configurações no backoffice — tudo com a mesma autenticação.

## Arquitetura

```text
                ┌────────────────────────────┐
                │   Supabase (banco + Auth)  │
                │   RLS, RPCs, Edge Functions│
                └────────────┬───────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼────────┐                       ┌────────▼─────────┐
│  lxp-alunos    │                       │  lxp-backoffice  │
│  jornada aluno │                       │  gestão admin    │
└───────┬────────┘                       └────────┬─────────┘
        │                                         │
        └────────► Alice ◄───────────────────────────┘
                   (conteúdo / e-book)
```

| App                | Para quem                                      | Função                                                             |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| **lxp-alunos**     | Aluno; equipe em modo moderação de comentários | Estudo, progresso, XP, certificados, portfólio, Tutor IA           |
| **lxp-backoffice** | Admin, coordenador, professor (RBAC)           | Cursos, alunos, equipe, gamificação, certificados, SMTP, auditoria |

## O que o aluno faz

- Login e perfil self-service
- Dashboard, meus cursos, catálogo de cursos livres
- Aulas com e-book Alice (layout imersivo), comentários e anotações
- Progresso (XP, nível, streak, horas estudadas)
- Portfólio (badges + certificados) e validação pública de certificado
- Tutor IA (MAIA) na aula, quando habilitado

## O que a equipe faz (backoffice)

- CRUD de cursos, períodos, grades e vínculo com biblioteca Alice
- Gestão de alunos (incl. bloqueio / reset de senha) e equipe (convites)
- Regras de XP, badges, níveis; reavaliar conquistas
- Templates e emissão de certificados
- Configurações: instituição, plano/limites, SMTP, auditoria

## O que já está entregue vs o que o cliente configura

| Entregue no código                       | A configurar na entrada em produção   |
| ---------------------------------------- | ----------------------------------------- |
| Apps, RLS, Edges, fluxos UAT             | Domínios finais (Vercel / DNS)            |
| Integração Alice (homolog)               | Hosts Alice + chaves no ambiente prod     |
| Auth Hook + SMTP institucional           | Secrets SMTP / MAIA no Dashboard Supabase |
| Roteiros em `docs/entrega/client-tests/` | Contas e dados reais de produção          |
| Migrations em `supabase/migrations/`     | Projeto Supabase novo (sem copiar a homolog; sem rodar `supabase/seeds/`) |
