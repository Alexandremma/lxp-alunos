import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLastCourseId } from "@/lib/lastCourseStorage";
import type { MyCourseSummary } from "@/types/myCourse";

type CourseSwitcherProps = {
  courses: MyCourseSummary[];
  currentCourseId: string;
  className?: string;
};

export function CourseSwitcher({ courses, currentCourseId, className }: CourseSwitcherProps) {
  const navigate = useNavigate();

  if (courses.length <= 1) return null;

  return (
    <Select
      value={currentCourseId}
      onValueChange={(courseId) => {
        setLastCourseId(courseId);
        navigate(`/meu-curso/${courseId}`);
      }}
    >
      <SelectTrigger className={className ?? "w-full md:w-[280px]"}>
        <SelectValue placeholder="Selecionar curso" />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
