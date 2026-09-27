# 04 — Aula com e-book (Alice)

## Objetivo

Validar montagem no backoffice e consumo imersivo no portal do aluno.

## Papéis

Admin + Aluno matriculado

## Passos — Backoffice

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Curso → disciplina → vincular conteúdo da biblioteca Alice | Vínculo salvo | |
| 2 | Garantir matrícula do aluno de teste | Aluno aparece na aba Alunos do curso/disciplina | |

## Passos — Aluno

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 3 | Entrar na disciplina → Continuar / abrir aula | Layout imersivo: e-book em destaque, header/sidebar úteis | |
| 4 | Navegar entre aulas (se houver) | Contador “aula X de Y” e progresso coerentes | |
| 5 | Concluir aula | Confirmação; progresso sobe; CTA para próxima aula quando houver | |
| 6 | Voltar à trilha e ao Início | Progresso refletido nos cards | |

## Observações

- Alice em geral **não** funciona em `localhost`; validar em URL publicada.  
- Comentários / Tutor IA: roteiros 09 e 12.
