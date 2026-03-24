export type EnrolledCourse = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "draft" | "archived";
  created_at: string;
};
