# 02 — Ficha técnica

## Identidade

| Item     | Valor                                                             |
| -------- | ----------------------------------------------------------------- |
| Cliente  | B42 Edtech                                                        |
| Apps     | `lxp-alunos`, `lxp-backoffice` (repositórios e deploys separados) |
| Backend  | Um projeto Supabase (Postgres + Auth + Storage + Edge Functions)  |
| Conteúdo | Alice (lista de disciplinas + launch do e-book) |

## Stack (espelhada nos dois fronts)

| Camada | Tecnologia                                                   |
| ------ | ------------------------------------------------------------ |
| Build  | Vite 5 + TypeScript                                          |
| UI     | React 18, Tailwind, ShadCN/Radix, next-themes (claro/escuro) |
| Dados  | TanStack Query v5, Supabase JS client                        |
| Auth   | Supabase Auth (`app_metadata.role` + tabela de equipe no BO) |
| Edges  | Deno em `lxp-backoffice/supabase/functions/`                 |

## Papéis

| Papel                                 | Onde                                   | Acesso                                                    |
| ------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| `student`                             | portal alunos                          | Rotas de aluno                                            |
| `admin` / `coordenador` / `professor` | backoffice (`backoffice_team_members`) | Matriz RBAC; no portal alunos só moderação de comentários |

## Rotas principais — alunos

| Rota                                                 | Uso                                   |
| ---------------------------------------------------- | ------------------------------------- |
| `/login`, `/definir-senha`                           | Auth                                  |
| `/`                                                  | Dashboard                             |
| `/meu-curso`, `/meus-cursos`                         | Grade / multi-curso                   |
| `/cursos-livres`                                     | Catálogo + auto-matrícula curso livre |
| `/trails/:id`, `.../lesson/:lessonId`                | Disciplina e aula                     |
| `/progress`                                          | Progresso (XP, streak, horas)         |
| `/portfolio`                                         | Badges e certificados                 |
| `/certificado/:disciplineId`, `/validar-certificado` | Certificado e validação pública       |
| `/perfil`                                            | Perfil self-service                   |

## Rotas principais — backoffice

| Rota                                              | Uso                                          |
| ------------------------------------------------- | -------------------------------------------- |
| `/admin/login`, `/admin/definir-senha`            | Auth equipe                                  |
| `/`                                               | Dashboard                                    |
| `/admin/alunos`, `/admin/equipe`, `/admin/cursos` | Gestão                                       |
| `/admin/gamificacao`, `/admin/certificados`       | Regras e templates                           |
| `/admin/configuracoes`                            | Geral, Instituição, E-mail (SMTP), Auditoria |
| `/admin/perfil`                                   | Perfil do membro                             |

## Métricas oficiais (produto)

| Métrica           | Fonte / regra                                               |
| ----------------- | ----------------------------------------------------------- |
| XP / nível        | Eventos + regras em `lxp_gamification_*`                    |
| Streak            | Dias consecutivos de **login** (`lxp_student_daily_access`) |
| Horas estudadas   | Heartbeat de sessão de estudo (`lxp_student_study_time`)    |
| Progresso de aula | Conclusão explícita pelo aluno                              |
| Certificado       | 100% da disciplina + template vigente; snapshot imutável    |

## Edge Functions (backoffice)

| Função                                     | Uso                                      |
| ------------------------------------------ | ---------------------------------------- |
| `invite-team-member`                       | Convite de equipe                        |
| `manage-student-admin`                     | Admin de aluno (bloqueio, reset, perfil) |
| `update-smtp-settings` / `send-test-email` | SMTP institucional                       |
| `auth-send-email`                          | Hook de e-mail Auth (sem JWT de usuário) |
| `ai-tutor-chat`                            | Proxy Tutor IA (MAIA)                    |
