# 02 — Auth e esqueci senha

## Objetivo

Garantir que recuperação de senha redireciona para as telas corretas (aluno e backoffice) e que o admin consegue disparar reset de aluno.

## Papéis

- Aluno, membro de equipe (admin), opcionalmente outro membro via convite

## Pré-requisitos

- Auth do Supabase com Site URL + Redirect URLs configurados  
- SMTP / Auth Hook funcionando (senão o e-mail não chega)

## Passos

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Aluno: **Esqueci minha senha** no `/login` | Mensagem de sucesso; e-mail chega | |
| 2 | Abrir link do e-mail | Abre `/definir-senha` no **portal alunos** (não 404 / domínio errado) | |
| 3 | Definir nova senha e entrar | Login ok com a nova senha | |
| 4 | Backoffice: esqueci senha no `/admin/login` | E-mail → `/admin/definir-senha` | |
| 5 | Admin: resetar senha de um aluno | E-mail do aluno aponta para o app **alunos** | |
| 6 | (Opcional) Convite de equipe | Link leva a `/admin/definir-senha` | |

## Problemas comuns

| Sintoma | Causa provável |
|---------|----------------|
| Link abre domínio antigo / Vercel B42 | Redirect URLs ou env `VITE_*_SET_PASSWORD_URL` desatualizados |
| E-mail não chega | SMTP / Auth Hook (ver roteiro 11) |
