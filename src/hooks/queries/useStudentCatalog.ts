import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/consts/queryKeys"
import {
  fetchFilteredStudentCatalogItems,
  getStudentDisciplinesCatalogStats,
  paginateCatalogItems,
} from "@/services/studentDisciplinesCatalogService"
import { useAuth } from "@/hooks/use-auth"
import type { StudentDisciplinesCatalogParams } from "@/types/studentCatalog"

export function useStudentCatalog(params: StudentDisciplinesCatalogParams) {
  const { profile } = useAuth()
  const { q = "", courseId, category = "all", progressStatus = "all", page = 1, pageSize = 15 } = params

  const filterKey = { q, courseId, category, progressStatus, profileId: profile?.id }

  const datasetQuery = useQuery({
    queryKey: queryKeys.catalog.dataset(filterKey),
    queryFn: async () => {
      if (!profile?.id) return []
      return fetchFilteredStudentCatalogItems(profile.id, {
        q,
        courseId,
        category,
        progressStatus,
      })
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  })

  const paged = useMemo(() => {
    return paginateCatalogItems(datasetQuery.data ?? [], page, pageSize)
  }, [datasetQuery.data, page, pageSize])

  return {
    items: paged.items,
    total: paged.total,
    page: paged.page,
    pageSize: paged.pageSize,
    from: paged.from,
    to: paged.to,
    isLoading: datasetQuery.isLoading,
    isFetching: datasetQuery.isFetching,
    error: datasetQuery.error,
    refetch: datasetQuery.refetch,
  }
}

export function useStudentCatalogStats() {
  const { profile } = useAuth()

  return useQuery({
    queryKey: queryKeys.catalog.stats(profile?.id),
    queryFn: async () => {
      if (!profile?.id) {
        return { enrolled: 0, completed: 0, available: 0, hoursStudied: 0 }
      }
      return getStudentDisciplinesCatalogStats(profile.id)
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  })
}
