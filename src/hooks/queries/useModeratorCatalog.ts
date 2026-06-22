import { useQuery } from "@tanstack/react-query";
import {
  getModeratorDisciplinesCatalog,
  listModeratorCatalogCourses,
} from "@/services/moderatorDisciplinesCatalogService";
import type { ModeratorDisciplinesCatalogParams } from "@/types/moderatorCatalog";

export const moderatorCatalogKeys = {
  list: (params: ModeratorDisciplinesCatalogParams) =>
    ["moderator", "catalog", params] as const,
  courses: () => ["moderator", "catalog", "courses"] as const,
};

export function useModeratorCatalog(params: ModeratorDisciplinesCatalogParams) {
  return useQuery({
    queryKey: moderatorCatalogKeys.list(params),
    queryFn: () => getModeratorDisciplinesCatalog(params),
    staleTime: 60_000,
  });
}

export function useModeratorCatalogCourses() {
  return useQuery({
    queryKey: moderatorCatalogKeys.courses(),
    queryFn: listModeratorCatalogCourses,
    staleTime: 60_000,
  });
}
