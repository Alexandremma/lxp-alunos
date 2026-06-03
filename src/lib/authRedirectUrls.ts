/** URLs de redirect Auth (homolog Vercel). Sobrescreva via env em prod/local. */
const HOMOLOG_ORIGIN = "https://lxp-alunos.vercel.app";

export const lxpAlunosSetPasswordUrl = (
  import.meta.env.VITE_LXP_ALUNOS_SET_PASSWORD_URL ?? `${HOMOLOG_ORIGIN}/definir-senha`
).trim();
