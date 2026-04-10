/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EADSTOCK_BASE_URL?: string
  readonly VITE_EADSTOCK_API_KEY?: string
  readonly VITE_EADSTOCK_API_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
