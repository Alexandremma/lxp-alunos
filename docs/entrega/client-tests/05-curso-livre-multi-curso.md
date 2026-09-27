# 05 — Curso livre e multi-curso

## Objetivo

Validar categoria curso livre, auto-matrícula no catálogo e navegação com mais de um curso.

## Papéis

Admin + Aluno

## Passos

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Admin cria/edita curso como **curso livre** com aulas | Curso visível no catálogo aluno | |
| 2 | Aluno em **Cursos livres** / catálogo | Filtra, pagina; vê CTA Inscrever-se | |
| 3 | Aluno se inscreve | Matrícula criada; passa a ver a disciplina | |
| 4 | Se aulas sequenciais: tentar pular aula 2 | Bloqueado até concluir a anterior | |
| 5 | Aluno com 2+ matrículas: **Meus cursos** / seletor | Alterna contexto sem misturar grades | |
| 6 | Abrir trilha sem matrícula (URL direta, se testável) | Mensagem de matrícula necessária | |

## Aceite

Catálogo e multi-curso usáveis sem erro; sequência respeitada quando configurada.
