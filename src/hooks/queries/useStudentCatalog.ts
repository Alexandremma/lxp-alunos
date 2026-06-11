import { useQuery } from "@tanstack/react-query"
import {
  getStudentDisciplinesCatalog,
  getStudentDisciplinesCatalogStats,
} from "@/services/studentDisciplinesCatalogService"
import { useAuth } from "@/hooks/use-auth"
import type { StudentDisciplinesCatalogParams } from "@/types/studentCatalog"

export function useStudentCatalog(params: StudentDisciplinesCatalogParams) {
  const { profile } = useAuth()
  const { q = "", courseId, category = "all", progressStatus = "all", page = 1, pageSize = 15 } = params

  const query = useQuery({
    queryKey: ["lxp", "catalog", { q, courseId, category, progressStatus, page, pageSize, profileId: profile?.id }],
    queryFn: async () => {
      if (!profile?.id) return { items: [], total: 0, page, pageSize }
      return getStudentDisciplinesCatalog(profile.id, {
        q,
        courseId,
        category,
        progressStatus,
        page,
        pageSize,
      })
    },
    enabled: !!profile?.id,
    placeholderData: (previousData) => previousData,
  })

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useStudentCatalogStats() {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ["lxp", "catalog", "stats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return { enrolled: 0, completed: 0, available: 0, hoursStudied: 0 }
      }
      return getStudentDisciplinesCatalogStats(profile.id)
    },
    enabled: !!profile?.id,
  })
}
