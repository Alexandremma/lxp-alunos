# 07 — Certificados

## Objetivo

Validar templates no backoffice, emissão no 100% da disciplina, PDF, portfólio e validação pública (QR).

## Papéis

Admin, Aluno, visitante anônimo

## Passos — Admin

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | `/admin/certificados` — template padrão / custom | Preview ok; assinaturas/logo conforme UI | |
| 2 | (Opcional) Fundo A4 paisagem no template custom | Aceito; preview coerente | |
| 3 | Histórico de emissões | Lista / download quando houver itens | |

## Passos — Aluno

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 4 | Concluir 100% da disciplina | CTA / card de certificado liberado | |
| 5 | Abrir certificado e baixar PDF | PDF paisagem; dados corretos | |
| 6 | Ver no Portfólio | Mesmo certificado listado | |

## Passos — Público

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 7 | Abrir `/validar-certificado?code=…` (ou QR) | Página pública confirma validade | |
| 8 | Alterar nome da disciplina no admin após emissão | Certificado antigo **não** muda (snapshot) | |

## Observação

QR e link público devem apontar para o **portal alunos** (`VITE_LXP_ALUNOS_PUBLIC_ORIGIN` em produção).
