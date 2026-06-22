import { supabase } from "@/lib/supabaseClient";
import { getDisciplineCoverPublicUrl } from "@/services/disciplinePresentationService";
import { paginateCatalogItems } from "@/services/studentDisciplinesCatalogService";
import type { CourseCategory } from "@/types/studentCatalog";
import type {
  ModeratorDisciplineCatalogItem,
  ModeratorDisciplinesCatalogParams,
  ModeratorDisciplinesCatalogResponse,
} from "@/types/moderatorCatalog";

type RawDisciplineRow = {
  id: string;
  name: string;
  code: string;
  workload: number | null;
  professor: string | null;
  status: string;
  course_period_id: string;
  cover_image_path: string | null;
};

export async function fetchModeratorCatalogItems(
  params: Omit<ModeratorDisciplinesCatalogParams, "page" | "pageSize"> = {},
): Promise<ModeratorDisciplineCatalogItem[]> {
  const q = params.q?.trim().toLowerCase() ?? "";
  const categoryFilter = params.category ?? "all";
  const courseFilter = params.courseId;

  const { data: links, error: linksError } = await supabase
    .from("lxp_course_library_links")
    .select("course_discipline_id")
    .eq("library_content_type", "discipline");

  if (linksError) throw linksError;

  const linkedDisciplineIds = [
    ...new Set((links ?? []).map((row) => row.course_discipline_id as string)),
  ];
  if (linkedDisciplineIds.length === 0) return [];

  const { data: disciplines, error: disciplinesError } = await supabase
    .from("lxp_course_disciplines")
    .select("id,name,code,workload,professor,course_period_id,status,cover_image_path")
    .in("id", linkedDisciplineIds)
    .eq("status", "active");

  if (disciplinesError) throw disciplinesError;

  const disciplineRows = (disciplines ?? []) as RawDisciplineRow[];
  if (disciplineRows.length === 0) return [];

  const periodIds = [...new Set(disciplineRows.map((d) => d.course_period_id))];
  const { data: periods, error: periodsError } = await supabase
    .from("lxp_course_periods")
    .select("id,course_id")
    .in("id", periodIds);

  if (periodsError) throw periodsError;

  const courseByPeriod = new Map(
    (periods ?? []).map((p) => [p.id as string, p.course_id as string]),
  );
  const courseIds = [...new Set([...courseByPeriod.values()])];

  const { data: courses, error: coursesError } = await supabase
    .from("lxp_courses")
    .select("id,name,category,status")
    .in("id", courseIds)
    .eq("status", "active");

  if (coursesError) throw coursesError;

  const courseMeta = new Map<
    string,
    { name: string; category: CourseCategory }
  >();
  for (const course of courses ?? []) {
    courseMeta.set(course.id as string, {
      name: (course.name as string)?.trim() || "Curso",
      category: (course.category as CourseCategory) ?? "graduation",
    });
  }

  const items: ModeratorDisciplineCatalogItem[] = [];

  for (const discipline of disciplineRows) {
    const courseId = courseByPeriod.get(discipline.course_period_id);
    if (!courseId) continue;

    const meta = courseMeta.get(courseId);
    if (!meta) continue;

    if (categoryFilter !== "all" && meta.category !== categoryFilter) continue;
    if (courseFilter && courseId !== courseFilter) continue;

    const haystack = [
      discipline.name,
      discipline.code,
      discipline.professor ?? "",
      meta.name,
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) continue;

    items.push({
      id: discipline.id,
      name: discipline.name,
      code: discipline.code,
      courseId,
      courseName: meta.name,
      courseCategory: meta.category,
      workloadHours: discipline.workload ?? undefined,
      professor: discipline.professor?.trim() || undefined,
      coverImageUrl: getDisciplineCoverPublicUrl(discipline.cover_image_path),
    });
  }

  items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return items;
}

export async function getModeratorDisciplinesCatalog(
  params: ModeratorDisciplinesCatalogParams = {},
): Promise<ModeratorDisciplinesCatalogResponse> {
  const pageSize = params.pageSize ?? 15;
  const page = params.page ?? 1;
  const filtered = await fetchModeratorCatalogItems(params);
  const paged = paginateCatalogItems(filtered, page, pageSize);

  return {
    items: paged.items,
    total: paged.total,
    page: paged.page,
    pageSize: paged.pageSize,
    from: paged.from,
    to: paged.to,
  };
}

export async function listModeratorCatalogCourses(): Promise<
  Array<{ id: string; name: string }>
> {
  const items = await fetchModeratorCatalogItems();
  const byId = new Map<string, string>();
  for (const item of items) {
    byId.set(item.courseId, item.courseName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
