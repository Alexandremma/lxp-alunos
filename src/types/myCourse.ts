export type SubjectStatus = "approved" | "in_progress" | "pending" | "failed";
export type PeriodStatus = "completed" | "current" | "future";

export type MyCourseSubject = {
  id: string;
  name: string;
  code: string;
  credits: number;
  creditsEnabled: boolean;
  workload: number;
  professor?: string;
  status: SubjectStatus;
  grade?: number;
  disciplineInactive?: boolean;
  enrollmentInactive?: boolean;
  /** Sem vínculo em lxp_course_library_links — conteúdo ainda não disponível. */
  hasContentLink?: boolean;
  progressPercent?: number;
  isComplete?: boolean;
};

export type MyCoursePeriod = {
  id: string;
  number: number;
  name: string;
  status: PeriodStatus;
  subjects: MyCourseSubject[];
};

export type MyCourseData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  periods: MyCoursePeriod[];
};

export type MyCourseSummary = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  totalDisciplines: number;
  completedDisciplines: number;
  progressPercent: number;
};
