import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getLibraryCatalog, type SearchLibraryResponse } from "@/services/libraryAdapter"
import { useAuth } from "@/hooks/use-auth"

export function useStudentCatalog(params: {
  q?: string
  type?: "trail" | "module" | "all"
  page?: number
  pageSize?: number
  category?: "course" | "language" | "workshop" | "certification" | "extension" | "all"
}) {
  const { profile } = useAuth()
  const { q = "", type = "all", page = 1, pageSize = 24, category = "all" } = params

  const query = useQuery<SearchLibraryResponse>({
    queryKey: ["lxp", "catalog", { q, type, page, pageSize, category, profileId: profile?.id }],
    queryFn: () => getLibraryCatalog({ q, type, page, pageSize }),
    enabled: !!profile?.id, // require student session
    keepPreviousData: true,
  })

  const items = useMemo(() => {
    const list = query.data?.items ?? []
    if (category === "all") return list
    return list.filter((i) => i.category === category)
  }, [query.data?.items, category])

  return {
    items,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}

