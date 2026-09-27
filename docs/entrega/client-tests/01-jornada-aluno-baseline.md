# 01 — Jornada do aluno (baseline)

## Objetivo

Validar o caminho feliz do aluno: login → início → curso/disciplina → aula → progresso → portfólio.

## Papéis

- Aluno matriculado em ao menos uma disciplina com conteúdo

## Pré-requisitos

- URLs dos apps de homolog/prod  
- Conta de aluno ativa (não bloqueada)

## Passos

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Abrir portal alunos → login com e-mail/senha | Entra no dashboard (`/`) | |
| 2 | Conferir dashboard | KPIs ou cards de disciplinas; tema claro/escuro funciona no header | |
| 3 | Abrir **Meu curso** ou **Meus cursos** | Grade / lista coerente com matrículas | |
| 4 | Abrir uma disciplina (trilha) | Página com progresso e lista de aulas | |
| 5 | Abrir uma aula | E-book / conteúdo carrega; navegação de aula visível | |
| 6 | Abrir **Progresso** (`/progress`) | XP, nível, streak e/ou horas sem erro | |
| 7 | Abrir **Portfólio** | Abas de badges e/ou certificados (mesmo vazias, sem erro) | |
| 8 | Abrir **Perfil**, alterar nome ou telefone, salvar | Persistência após F5 | |
| 9 | Logout e login de novo | Sessão encerra e autentica de novo | |

## Fora de escopo

Certificado 100%, SMTP, RBAC admin (roteiros dedicados).
