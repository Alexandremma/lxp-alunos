# 11 — SMTP e e-mail institucional

## Objetivo

Validar fallback B42, SMTP próprio, teste de e-mail e impacto em convite / Auth.

## Papéis

Somente admin (edição SMTP)

## Pré-requisitos

- Ambiente acordado (preferencialmente homolog)  
- Destinatários de teste autorizados  
- Credenciais SMTP do cliente (cenário B)

## Passos

| # | Ação | Resultado esperado | Pass/Fail |
|---|------|--------------------|-----------|
| 1 | Sem SMTP institucional: enviar e-mail de teste | Usa fallback; auditoria `teste` / envio registrada | |
| 2 | Disparar convite de equipe ou reset | E-mail chega via mesmo canal | |
| 3 | Salvar SMTP institucional válido | Senha não reaparece em claro; status ok | |
| 4 | E-mail de teste com SMTP próprio | Entrega ok; auditoria ok | |
| 5 | Desligar / invalidar SMTP | Volta ao fallback ou erro claro | |
| 6 | Coord tenta acessar edição SMTP | Negado | |

## Aceite do cliente

Consciência de SPF/DKIM no domínio remetente. Não versionar senhas SMTP.
