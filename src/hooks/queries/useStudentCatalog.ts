import { useQuery } from "@tanstack/react-query"
import {
  getEnrolledLinkedDisciplinesCatalog,
  type SearchLibraryResponse,
} from "@/services/libraryAdapter"
import { useAuth } from "@/hooks/use-auth"

export function useStudentCatalog(params: {
  q?: string
  type?: "discipline" | "all"
  page?: number
  pageSize?: number
}) {
  const { profile } = useAuth()
  const { q = "", type = "all", page = 1, pageSize = 24 } = params

  const query = useQuery<SearchLibraryResponse, Error>({
    queryKey: ["lxp", "catalog", { q, type, page, pageSize, profileId: profile?.id }],
    queryFn: async () => {
      if (!profile?.id) return { items: [], total: 0 }
      // Fonte única: disciplinas das matrículas do aluno com vínculo de conteúdo (não catálogo Eadstock genérico).
      return getEnrolledLinkedDisciplinesCatalog(profile.id, { q })
    },
    enabled: !!profile?.id, // require student session
    placeholderData: (previousData) => previousData,
  })

  /** Lista completa; filtro por aba fica na UI para não zerar contagens globais. */
  const items = query.data?.items ?? []

  return {
    items,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

