export type SubjectStatus = "approved" | "in_progress" | "pending" | "failed";
export type PeriodStatus = "completed" | "current" | "future";

export type MyCourseSubject = {
  id: string;
  name: string;
  code: string;
  credits: number;
  workload: number;
  professor?: string;
  status: SubjectStatus;
  grade?: number;
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
