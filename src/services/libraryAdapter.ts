export type LibraryContentType = "discipline"

export type LibraryItem = {
  id: string
  name: string
  type: LibraryContentType
  description?: string
  tags?: string[]
  duration?: string
  modulesCount?: number
  lessonsCount?: number
  category?: "course" | "language" | "workshop" | "certification" | "extension"
  progressPercent?: number
  enrolled?: boolean
}

export type SearchLibraryParams = {
  q?: string
  type?: LibraryContentType | "all"
  page?: number
  pageSize?: number
}

export type SearchLibraryResponse = {
  items: LibraryItem[]
  total: number
}

type EadstockDisciplineListItem = {
  id: number | string
  hash?: string | null
  nome?: string | null
  ementa?: string | null
  carga_horaria?: number | string | null
  autores_concat?: string | null
  total_unidades?: number | null
  disciplina_situacao_id?: number | null
  ativo?: number | null
}

type EadstockListResponse = {
  data?: EadstockDisciplineListItem[]
  total?: number
}

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return ""
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) return baseUrl
  return `https://${baseUrl}`
}

function toDurationLabel(value: EadstockDisciplineListItem["carga_horaria"]): string | undefined {
  if (value == null || value === "") return undefined
  return `${value}h`
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = import.meta.env.VITE_EADSTOCK_API_KEY
  const apiSecret = import.meta.env.VITE_EADSTOCK_API_SECRET

  if (apiKey) headers["X-API-Key"] = apiKey
  // TODO: Confirmar formato final de X-API-Secret (sha256 ou valor bruto).
  if (apiSecret) headers["X-API-Secret"] = apiSecret

  return headers
}

export async function getLibraryCatalog(params: SearchLibraryParams): Promise<SearchLibraryResponse> {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL)
  if (!baseUrl) {
    // TODO: Definir VITE_EADSTOCK_BASE_URL por ambiente para habilitar listagem real no LXP.
    return { items: [], total: 0 }
  }

  const query = new URLSearchParams()
  query.set("page", String(params.page ?? 1))
  query.set("pageSize", String(params.pageSize ?? 24))
  if (params.q?.trim()) query.set("disciplina", params.q.trim())

  const response = await fetch(`${baseUrl}/scout/disciplinas/list?${query.toString()}`, {
    method: "GET",
    headers: buildHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Falha ao carregar catalogo da biblioteca (${response.status}).`)
  }

  const payload = (await response.json()) as EadstockListResponse
  const rows = payload.data ?? []

  const filtered = rows.filter((row) => {
    // TODO: Confirmar regra final de publicacao por disciplina_situacao_id para o aluno.
    const hasAllowedStatus = row.disciplina_situacao_id == null || row.disciplina_situacao_id === 3
    const isActive = row.ativo == null || row.ativo === 1
    return hasAllowedStatus && isActive
  })

  return {
    items: filtered.map((row) => ({
      id: String(row.id),
      name: row.nome?.trim() || row.hash?.trim() || `Disciplina ${row.id}`,
      type: "discipline",
      description: row.ementa ?? undefined,
      tags: row.autores_concat ? row.autores_concat.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      duration: toDurationLabel(row.carga_horaria),
      lessonsCount: row.total_unidades ?? undefined,
      category: "extension",
      enrolled: false,
      progressPercent: 0,
    })),
    total: payload.total ?? filtered.length,
  }
}

