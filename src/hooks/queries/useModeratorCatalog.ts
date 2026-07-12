import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import {
  getModeratorDisciplinesCatalog,
  listModeratorCatalogCourses,
} from "@/services/moderatorDisciplinesCatalogService";
import type { ModeratorDisciplinesCatalogParams } from "@/types/moderatorCatalog";

export function useModeratorCatalog(params: ModeratorDisciplinesCatalogParams) {
  return useQuery({
    queryKey: queryKeys.moderatorCatalog.list(params),
    queryFn: () => getModeratorDisciplinesCatalog(params),
    staleTime: 60_000,
  });
}

export function useModeratorCatalogCourses() {
  return useQuery({
    queryKey: queryKeys.moderatorCatalog.courses(),
    queryFn: listModeratorCatalogCourses,
    staleTime: 60_000,
  });
}
