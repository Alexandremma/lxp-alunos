import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyLearning } from "@/components/states/EmptyLearning";
import { BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModerationModeBanner } from "@/components/learning/ModerationModeBanner";
import { ModeratorDisciplineCatalogCard } from "@/components/learning/ModeratorDisciplineCatalogCard";
import {
  useModeratorCatalog,
  useModeratorCatalogCourses,
} from "@/hooks/queries/useModeratorCatalog";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import type { CourseCategory } from "@/types/studentCatalog";

const PAGE_SIZE = 15;

function parsePageParam(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function ModeratorDisciplinesView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { teamRoleLabel } = useTeamModeration();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "all">("all");

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

  const { data: courses = [] } = useModeratorCatalogCourses();
  const { data, isLoading, isFetching, error, refetch } = useModeratorCatalog({
    q: search,
    courseId: courseFilter === "all" ? undefined : courseFilter,
    category: categoryFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!isLoading && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, totalPages, setPage]);

  const hasActiveFilters = useMemo(
    () => search.trim().length > 0 || courseFilter !== "all" || categoryFilter !== "all",
    [search, courseFilter, categoryFilter],
  );

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("all");
    setCategoryFilter("all");
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Disciplinas"
          description={`Moderação de comentários${teamRoleLabel ? ` · ${teamRoleLabel}` : ""}. Escolha uma disciplina e acesse as aulas para revisar a discussão.`}
        />

        <ModerationModeBanner />

        {isFetching && !isLoading && (
          <p className="text-xs text-muted-foreground">Atualizando catálogo...</p>
        )}

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {total} disciplina{total === 1 ? "" : "s"} com conteúdo disponível para moderação.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Buscar por disciplina, código, curso ou professor..."
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
              {courses.map((course) => (
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
                <ModeratorDisciplineCatalogCard
                  key={item.id}
                  item={item}
                  onOpenDiscipline={(id) => navigate(`/trails/${id}`)}
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
            description="Não há disciplinas com conteúdo vinculado para os filtros selecionados."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
