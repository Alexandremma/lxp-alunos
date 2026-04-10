// LXP adapter stub for external catalog (trails/modules).
// Pending: replace with real HTTP integration once the external API schema/endpoints are available.
export type LibraryContentType = "trail" | "module"

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

export async function getLibraryCatalog(params: SearchLibraryParams): Promise<SearchLibraryResponse> {
  // For now, return empty results to enable UI wiring without mocks.
  return { items: [], total: 0 }
}

