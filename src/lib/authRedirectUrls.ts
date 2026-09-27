/**
 * Auth redirect URLs. Production requires env; homolog fallback only in non-PROD builds.
 */
const HOMOLOG_ORIGIN = "https://lxp-alunos.vercel.app";

function resolveUrl(envName: string, envValue: string | undefined, fallback: string): string {
  const fromEnv = envValue?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) {
    throw new Error(`${envName} is required in production`);
  }
  return fallback;
}

export const lxpAlunosSetPasswordUrl = resolveUrl(
  "VITE_LXP_ALUNOS_SET_PASSWORD_URL",
  import.meta.env.VITE_LXP_ALUNOS_SET_PASSWORD_URL,
  `${HOMOLOG_ORIGIN}/definir-senha`,
);
