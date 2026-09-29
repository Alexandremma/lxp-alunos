# 06 — Gamificação

## Objetivo

Validar XP, nível, streak, badges e painel admin (incluindo reavaliação).

## Papéis

Admin + Aluno

## Passos — Aluno

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Concluir uma aula | XP de conclusão refletido (aula / trilha / progresso) | |
| 2 | Fazer login em dia novo (ou simular acesso diário) | Streak conta dia de **login** | |
| 3 | Comentar na aula (se habilitado) | XP de comentário conforme regra | |
| 4 | Abrir Progresso e Portfólio | Nível/XP coerentes; badges listados se conquistados | |

## Passos — Admin

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 5 | `/admin/gamificacao` — abas Pontos / Conquistas / Níveis | Listas editáveis (conforme RBAC) | |
| 6 | Ajustar uma regra de XP e repetir ação no aluno | Valor novo passa a valer | |
| 7 | **Reavaliar todos os alunos** (se disponível) | Conclui sem erro; badges atualizam quando cabível | |

## Notas de produto

- Streak oficial = login diário consecutivo (não “aula por dia”), salvo decisão futura do cliente.  
- Curtidas / papel instrutor na discussão: fora do pacote atual se não aparecerem na UI.
