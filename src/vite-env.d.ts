/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EADSTOCK_BASE_URL?: string
  readonly VITE_EADSTOCK_API_KEY?: string
  readonly VITE_EADSTOCK_API_SECRET?: string
  readonly VITE_ALICE_BASE_URL?: string
  readonly VITE_ALICE_API_KEY?: string
  readonly VITE_ALICE_API_SECRET?: string
  readonly VITE_ALICE_LAUNCH_USE_HTTP?: string
  readonly VITE_LXP_ALUNOS_SET_PASSWORD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
