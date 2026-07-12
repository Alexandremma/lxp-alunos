/**
 * API Alice (EaDStock) — GET /api/rents + launch POST (?c= + HMAC).
 * @see INTEGRACAO_ALICE_EADSTOCK.md
 */

import { resolveAliceBaseUrl } from "@/lib/resolveAliceBaseUrl"
import type { AliceDisciplineRents, AliceRent } from "@/types/alice"

export type { AliceDisciplineRents, AliceLaunchUser, AliceRent } from "@/types/alice"

type AliceRentRaw = {
  id?: number
  hash?: string
  url?: string
  url_completa?: string
  nome_unidade?: string
  unit?: { id?: number; nome?: string }
}

type AliceRentsResponse = {
  status?: number
  data?: Array<{
    discipline?: { id?: number; nome?: string }
    rents?: AliceRentRaw[]
  }>
}

export function isAliceConfigured(): boolean {
  const key = import.meta.env.VITE_ALICE_API_KEY?.trim()
  const secret = import.meta.env.VITE_ALICE_API_SECRET?.trim()
  return Boolean(key && secret)
}

function getAliceCredentials(): { apiKey: string; secret: string } | null {
  const apiKey = import.meta.env.VITE_ALICE_API_KEY?.trim()
  const secret = import.meta.env.VITE_ALICE_API_SECRET?.trim()
  if (!apiKey || !secret) return null
  return { apiKey, secret }
}

/** Só Basic + Accept — X-Api-Key / X-Secret-Key quebram CORS no browser (preflight). */
export function buildAliceApiHeaders(): HeadersInit {
  const creds = getAliceCredentials()
  if (!creds) return { Accept: "application/json" }
  const basic = btoa(`${creds.apiKey}:${creds.secret}`)
  return {
    Accept: "application/json",
    Authorization: `Basic ${basic}`,
  }
}

export function parseAliceContentId(urlOrHash: string): string {
  const trimmed = urlOrHash.trim()
  if (!trimmed) return ""
  try {
    if (trimmed.startsWith("http")) {
      const u = new URL(trimmed)
      return u.searchParams.get("c") ?? trimmed
    }
  } catch {
    /* hash puro */
  }
  return trimmed
}

function mapRentRaw(raw: AliceRentRaw): AliceRent | null {
  const url = (raw.url_completa ?? raw.url ?? "").trim()
  const hash = (raw.hash ?? "").trim()
  const contentId = parseAliceContentId(url || hash)
  if (!contentId) return null
  return {
    id: raw.id ?? 0,
    hash,
    urlCompleta: url || `https://alice.eadstock.com.br/?c=${contentId}`,
    nomeUnidade: (raw.nome_unidade ?? raw.unit?.nome ?? "").trim() || "Unidade",
    contentId,
  }
}

export async function fetchAliceRents(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<AliceDisciplineRents[]> {
  const base = resolveAliceBaseUrl(import.meta.env.VITE_ALICE_BASE_URL)
  if (!isAliceConfigured()) return []

  const qs = new URLSearchParams()
  qs.set("page", String(params?.page ?? 1))
  qs.set("limit", String(params?.limit ?? 50))
  const search = params?.search?.trim()
  if (search && search.length >= 2) qs.set("search", search)

  const response = await fetch(`${base}/api/rents?${qs}`, {
    method: "GET",
    headers: buildAliceApiHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Alice /api/rents falhou (${response.status}).`)
  }

  const payload = (await response.json()) as AliceRentsResponse
  const groups = payload.data ?? []

  return groups.map((group) => ({
    disciplineId: group.discipline?.id ?? 0,
    disciplineName: group.discipline?.nome?.trim() ?? "Disciplina",
    rents: (group.rents ?? []).map(mapRentRaw).filter((r): r is AliceRent => r !== null),
  }))
}

export async function fetchAliceRentsForDiscipline(
  disciplineId: string | number,
  searchHint?: string,
): Promise<AliceRent[]> {
  const id = String(disciplineId)
  const groups = await fetchAliceRents({
    limit: 50,
    search: searchHint && searchHint.length >= 2 ? searchHint : undefined,
  })
  const match = groups.find((g) => String(g.disciplineId) === id)
  if (match) return match.rents

  const all = await fetchAliceRents({ limit: 50 })
  return all.find((g) => String(g.disciplineId) === id)?.rents ?? []
}

/** HMAC-SHA256(api_key, secret_key) — equivalente ao PHP hash_hmac('sha256', $key, $secret). */
export async function computeAliceLaunchKey(apiKey: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(apiKey))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function buildAliceLaunchUrl(contentId: string, useHttp?: boolean): string {
  const scheme =
    useHttp || import.meta.env.VITE_ALICE_LAUNCH_USE_HTTP === "true" ? "http" : "https"
  const base = resolveAliceBaseUrl(import.meta.env.VITE_ALICE_BASE_URL).replace(/^https?:\/\//, "")
  return `${scheme}://${base}/?c=${encodeURIComponent(parseAliceContentId(contentId))}`
}

export function splitAlicePersonName(fullName: string): { given: string; family: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { given: fullName.trim() || "Aluno", family: "LXP" }
  return {
    family: parts.slice(0, -1).join(" "),
    given: parts[parts.length - 1],
  }
}

export async function getAliceLaunchKeyForApp(): Promise<string | null> {
  const creds = getAliceCredentials()
  if (!creds) return null
  return computeAliceLaunchKey(creds.apiKey, creds.secret)
}

/** Correlaciona rents com unidades por índice (ordem) ou nome parecido. */
export function matchAliceRentForLesson(
  rents: AliceRent[],
  unitTitle: string,
  index: number,
): AliceRent | undefined {
  if (rents.length === 0) return undefined
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ")
  const title = norm(unitTitle)
  const byName = rents.find((r) => {
    const n = norm(r.nomeUnidade)
    return n === title || n.includes(title) || title.includes(n)
  })
  return byName ?? rents[index]
}
