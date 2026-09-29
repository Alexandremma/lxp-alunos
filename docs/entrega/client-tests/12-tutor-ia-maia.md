# 12 — Tutor IA (MAIA)

## Objetivo

Validar o Tutor IA na aula do aluno.

## Papéis

Aluno autenticado, em uma aula com conteúdo

## Pré-requisitos

- Secret `MAIA_API_KEY` (e opcionais) configurado no projeto Supabase  
- Feature visível na UI da aula

## Passos

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Abrir uma aula no portal alunos | Painel do Tutor IA disponível | |
| 2 | Enviar uma pergunta simples sobre o conteúdo | Resposta chega (streaming ou bloco); sem erro genérico de rede | |
| 3 | Nova pergunta na mesma sessão | Continua utilizável | |
| 4 | (Opcional) Sem secret / secret inválido em homolog de teste | Erro compreensível, sem quebrar a aula | |

## Fora de escopo

Configuração do agente MAIA no lado Corp/cliente além da chave no Dashboard.
