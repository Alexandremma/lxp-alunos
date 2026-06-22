import type { CourseCategory } from "@/types/studentCatalog";

export type ModeratorDisciplineCatalogItem = {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName: string;
  courseCategory: CourseCategory;
  workloadHours?: number;
  professor?: string;
  coverImageUrl?: string | null;
};

export type ModeratorDisciplinesCatalogParams = {
  q?: string;
  courseId?: string;
  category?: CourseCategory | "all";
  page?: number;
  pageSize?: number;
};

export type ModeratorDisciplinesCatalogResponse = {
  items: ModeratorDisciplineCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  from: number;
  to: number;
};
