import type { AliceRent } from "@/types/alice"

export type ExternalAuthor = { nome?: string | null }

export type ExternalUnit = {
  id: number | string
  nome?: string | null
  order?: number | null
  url_caderno_digital?: string | null
  autores?: ExternalAuthor[] | null
}

export type ExternalDisciplineDetail = {
  id: number | string
  nome?: string | null
  ementa?: string | null
  carga_horaria?: number | string | null
  unidades?: ExternalUnit[]
  autores?: ExternalAuthor[] | null
}

/** Chave = `trailId` da rota (UUID da disciplina no LXP), para não colidir quando o mesmo ID externo 9001 liga várias disciplinas. */
export const detailCache = new Map<string, ExternalDisciplineDetail>()
export const aliceRentsCache = new Map<string, AliceRent[]>()

export const ALICE_MODULE_ID = "alice-unidades"

export const TRAIL_ID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
