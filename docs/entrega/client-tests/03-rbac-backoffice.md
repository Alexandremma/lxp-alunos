# 03 — RBAC do backoffice

## Objetivo

Confirmar que admin, coordenador e professor veem e fazem apenas o permitido.

## Papéis

Três contas distintas: admin, coordenador, professor.

## Passos — Admin

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Login admin | Menu completo: alunos, equipe, cursos, gamificação, certificados, configurações | |
| 2 | Abrir Configurações | Abas Geral / Instituição / E-mail / Auditoria acessíveis | |
| 3 | Equipe | Pode convidar e gerenciar conforme UI | |

## Passos — Coordenador

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 4 | Login coord | **Sem** menu Configurações (ou acesso negado se URL direta) | |
| 5 | Alunos / Cursos | CRUD permitido conforme tela | |
| 6 | Gamificação / Certificados | Escrita limitada ou somente leitura conforme UI (sem editar níveis/ações se bloqueado) | |

## Passos — Professor

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 7 | Login professor | Alunos tipicamente leitura; pode matricular se a UI permitir | |
| 8 | Gamificação / Certificados | Sem criar templates ou editar regras se a matriz negar | |
| 9 | URL direta `/admin/configuracoes` | Negado / redirecionado | |

## Fora de entrega

Módulos removidos (Produtos, Financeiro, Tickets) não devem reaparecer no menu.
