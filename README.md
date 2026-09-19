# LXP Alunos

Portal do aluno do ecossistema **B42 LXP** (Vite + React + TypeScript + Supabase).

## Desenvolvimento

```bash
npm install
cp .env.example .env   # preencher VITE_SUPABASE_* e Alice
npm run dev            # http://localhost:8080
```

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Dev server |
| `npm run build` | Build produção |
| `npm run preview` | Preview do build |
| `npm test` | Vitest |

## Deploy

Homolog/produção via **Vercel** (branch `main`). Variáveis: ver `.env.example` e `docs-central/spec-kit/08_AMBIENTE_DEPLOY.md`.
