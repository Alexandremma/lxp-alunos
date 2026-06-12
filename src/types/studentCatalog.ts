export type CourseCategory = "graduation" | "postgraduate" | "extension" | "free_course";

export type DisciplineProgressStatus =
  | "available"
  | "enrolled"
  | "completed"
  | "discipline_inactive"
  | "enrollment_inactive";

export type StudentDisciplineCatalogItem = {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName: string;
  courseCategory: CourseCategory;
  progressStatus: DisciplineProgressStatus;
  progressPercent: number;
  canSelfEnroll: boolean;
  workloadHours?: number;
  credits?: number;
  professor?: string;
};

export type StudentDisciplinesCatalogParams = {
  q?: string;
  courseId?: string;
  category?: CourseCategory | "all";
  progressStatus?: DisciplineProgressStatus | "all";
  page?: number;
  pageSize?: number;
};

export type StudentDisciplinesCatalogResponse = {
  items: StudentDisciplineCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  /** 1-based index of first item on this page (0 when empty). */
  from: number;
  /** 1-based index of last item on this page (0 when empty). */
  to: number;
};
