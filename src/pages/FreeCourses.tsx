import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmptyLearning } from "@/components/states/EmptyLearning";
import {
  Clock,
  Users,
  ChevronRight,
  GraduationCap,
  BookOpen,
  BookMarked,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentCatalog, useStudentCatalogStats } from "@/hooks/queries/useStudentCatalog";
import { useGetActiveEnrolledCourses } from "@/hooks/queries/useGetActiveEnrolledCourses";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useEnrollInTrail } from "@/hooks/mutations/useEnrollInTrail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CourseCategory,
  DisciplineProgressStatus,
  StudentDisciplineCatalogItem,
} from "@/types/studentCatalog";

const PAGE_SIZE = 15;

function parsePageParam(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

const categoryConfig: Record<
  CourseCategory,
  { label: string; icon: typeof GraduationCap; color: string }
> = {
  graduation: {
    label: "Graduação",
    icon: GraduationCap,
    color: "bg-secondary/10 text-secondary border-secondary/20",
  },
  postgraduate: {
    label: "Pós-Graduação",
    icon: GraduationCap,
    color: "bg-info/10 text-info border-info/20",
  },
  extension: {
    label: "Extensão",
    icon: BookMarked,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  free_course: {
    label: "Curso livre",
    icon: BookOpen,
    color: "bg-warning/10 text-warning border-warning/20",
  },
};

const statusConfig: Record<
  DisciplineProgressStatus,
  { label: string; color: string }
> = {
  available: { label: "Disponível", color: "bg-muted text-muted-foreground" },
  enrolled: { label: "Cursando", color: "bg-primary/10 text-primary" },
  completed: { label: "Concluído", color: "bg-success/10 text-success" },
  discipline_inactive: { label: "Disciplina inativa", color: "bg-warning/10 text-warning border-warning/30" },
  enrollment_inactive: { label: "Matrícula inativa", color: "bg-destructive/10 text-destructive" },
};

const DisciplineCard = ({
  item,
  onEnroll,
  onOpenDiscipline,
}: {
  item: StudentDisciplineCatalogItem;
  onEnroll: (id: string) => void;
  onOpenDiscipline: (id: string) => void;
}) => {
  const category = categoryConfig[item.courseCategory];
  const CategoryIcon = category.icon;
  const status = statusConfig[item.progressStatus];
  const showProgress =
    item.progressStatus === "enrolled" ||
    item.progressStatus === "completed" ||
    item.progressStatus === "discipline_inactive" ||
    item.progressStatus === "enrollment_inactive";

  const isBlocked =
    item.progressStatus === "discipline_inactive" ||
    item.progressStatus === "enrollment_inactive";

  return (
    <Card className="overflow-hidden card-hover group">
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center overflow-hidden">
        {item.coverImageUrl ? (
          <>
            <img
              src={item.coverImageUrl}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
          </>
        ) : (
          <CategoryIcon className="h-12 w-12 text-primary/40" />
        )}
        <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-8.5rem)] min-w-0">
          <Badge variant="outline" className={cn("backdrop-blur-sm gap-1", category.color)}>
            <CategoryIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{category.label}</span>
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10 shrink-0">
          <Badge className={cn("shrink-0", status.color)}>{status.label}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-1">{item.courseName}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          {(item.workloadHours ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 shrink-0" />
              {item.workloadHours}h
            </span>
          )}
          {(item.credits ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 shrink-0" />
              {item.credits} créditos
            </span>
          )}
          {item.professor && item.professor !== "—" && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0" />
              {item.professor}
            </span>
          )}
        </div>

        {showProgress && (
          <div className="mb-4 min-h-[2.25rem]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{item.progressPercent}%</span>
            </div>
            <Progress value={item.progressPercent} className="h-2" />
          </div>
        )}

        <Button
          className="w-full"
          variant={
            item.canSelfEnroll
              ? "default"
              : item.progressStatus === "enrolled"
                ? "secondary"
                : "outline"
          }
          disabled={isBlocked}
          onClick={() => {
            if (item.canSelfEnroll) onEnroll(item.id);
            else if (item.progressStatus === "enrolled" || item.progressStatus === "completed") {
              onOpenDiscipline(item.id);
            }
          }}
        >
          {item.progressStatus === "discipline_inactive" && "Disciplina inativa"}
          {item.progressStatus === "enrollment_inactive" && "Matrícula inativa"}
          {item.canSelfEnroll && "Inscrever-se"}
          {item.progressStatus === "enrolled" && (
            <>
              {item.progressPercent > 0 ? "Continuar" : "Iniciar"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
          {item.progressStatus === "completed" && "Concluído"}
        </Button>
      </CardContent>
    </Card>
  );
};

const FreeCourses = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "all">("all");
  const [progressFilter, setProgressFilter] = useState<DisciplineProgressStatus | "all">("all");

  const page = parsePageParam(searchParams.get("page"));

  const setPage = useCallback(
    (next: number | ((current: number) => number)) => {
      setSearchParams(
        (prev) => {
          const current = parsePageParam(prev.get("page"));
          const resolved = typeof next === "function" ? next(current) : next;
          const safePage = Math.max(1, resolved);
          const params = new URLSearchParams(prev);

          if (safePage <= 1) {
            params.delete("page");
          } else {
            params.set("page", String(safePage));
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const enrollInTrail = useEnrollInTrail();
  const { data: enrolledCoursesData } = useGetActiveEnrolledCourses(profile?.id);
  const { data: stats } = useStudentCatalogStats();
  const { items, total, from, to, isLoading, isFetching, error, refetch } = useStudentCatalog({
    q: search,
    courseId: courseFilter === "all" ? undefined : courseFilter,
    category: categoryFilter,
    progressStatus: progressFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const enrolledCourses = enrolledCoursesData ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!isLoading && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, totalPages, setPage]);

  const hasActiveFilters = useMemo(
    () =>
      search.trim().length > 0 ||
      courseFilter !== "all" ||
      categoryFilter !== "all" ||
      progressFilter !== "all",
    [search, courseFilter, categoryFilter, progressFilter],
  );

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("all");
    setCategoryFilter("all");
    setProgressFilter("all");
    setPage(1);
  };

  const handleEnroll = (id: string) => {
    enrollInTrail.mutate(id, {
      onSuccess: () => {
        toast.success("Matrícula realizada com sucesso.");
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Não foi possível concluir a matrícula.";
        toast.error(message);
      },
    });
  };

  const handleOpenDiscipline = (id: string) => {
    navigate(`/trails/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Minhas Disciplinas"
          description="Acompanhe e continue suas disciplinas. Filtre por curso, categoria ou progresso."
        />
        {isFetching && !isLoading && (
          <p className="text-xs text-muted-foreground">Atualizando catálogo...</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats?.enrolled ?? 0}</div>
              <p className="text-xs text-muted-foreground">Cursando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats?.completed ?? 0}</div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats?.hoursStudied ?? 0}h</div>
              <p className="text-xs text-muted-foreground">Horas Cursadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats?.available ?? 0}</div>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Buscar disciplina..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="md:flex-1"
          />
          <Select
            value={courseFilter}
            onValueChange={(v) => {
              setCourseFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {enrolledCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v as CourseCategory | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="graduation">Graduação</SelectItem>
              <SelectItem value="postgraduate">Pós-Graduação</SelectItem>
              <SelectItem value="extension">Extensão</SelectItem>
              <SelectItem value="free_course">Curso livre</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={progressFilter}
            onValueChange={(v) => {
              setProgressFilter(v as DisciplineProgressStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Progresso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="enrolled">Cursando</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="discipline_inactive">Disciplina inativa</SelectItem>
              <SelectItem value="enrollment_inactive">Matrícula inativa</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          )}
        </div>

        {isLoading ? (
          <QueryStateCard
            state="loading"
            title="Carregando disciplinas..."
            description="Aguarde um instante"
            icon={BookMarked}
          />
        ) : error ? (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar as disciplinas"
            description="Verifique sua conexão e tente novamente."
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
            icon={BookMarked}
          />
        ) : items.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <DisciplineCard
                  key={item.id}
                  item={item}
                  onEnroll={handleEnroll}
                  onOpenDiscipline={handleOpenDiscipline}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
              <p className="text-sm text-muted-foreground">
                Mostrando {from}–{to} de {total} disciplina{total === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyLearning
            type="trails"
            title="Nenhuma disciplina encontrada"
            description="Não há disciplinas com os filtros selecionados. Tente ajustar a busca."
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default FreeCourses;
