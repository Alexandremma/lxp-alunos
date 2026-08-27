import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameBadge } from "@/components/learning/GameBadge";
import { CertificateEvidenceCard } from "@/components/learning/CertificateEvidenceCard";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { useAuth } from "@/hooks/use-auth";
import { usePortfolioEvidences } from "@/hooks/queries/usePortfolioEvidences";
import type { LearningEvidence } from "@/types/learningEvidence";
import { Award, BookOpen, GraduationCap } from "lucide-react";

/** Abas ativas no MVP — Projetos/Participações sem schema (não exibir). */
type ActiveFilter = Extract<LearningEvidence["type"], "badge" | "certificate">;

const filterConfig: Record<ActiveFilter, { label: string; icon: React.ElementType }> = {
  badge: { label: "Badges", icon: Award },
  certificate: { label: "Certificados", icon: GraduationCap },
};

const TAB_QUERY_BY_FILTER: Record<ActiveFilter, string | null> = {
  badge: null,
  certificate: "certificados",
};

function filterFromTabParam(tab: string | null): ActiveFilter {
  const key = tab?.toLowerCase() ?? "";
  if (["certificados", "certificate", "certificado"].includes(key)) {
    return "certificate";
  }
  // badges (default) — também redireciona abas sem schema (projetos / participação)
  return "badge";
}

const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };

const Portfolio = () => {
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = usePortfolioEvidences(profile?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [filter, setFilter] = useState<ActiveFilter>(() => filterFromTabParam(tabParam));

  useEffect(() => {
    setFilter(filterFromTabParam(tabParam));
  }, [tabParam]);

  const syncTabToUrl = useCallback(
    (next: ActiveFilter) => {
      const slug = TAB_QUERY_BY_FILTER[next];
      if (!slug) {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: slug }, { replace: true });
      }
    },
    [setSearchParams],
  );

  const handleFilterChange = useCallback(
    (v: string) => {
      const next = v as ActiveFilter;
      setFilter(next);
      syncTabToUrl(next);
    },
    [syncTabToUrl],
  );

  const evidences = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(
    () => evidences.filter((e) => e.type === filter),
    [evidences, filter],
  );

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (filter === "badge") {
        const rarityA = rarityOrder[a.rarity || "common"] ?? 4;
        const rarityB = rarityOrder[b.rarity || "common"] ?? 4;
        if (rarityA !== rarityB) return rarityA - rarityB;
      }
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    });
  }, [filtered, filter]);

  const getCounts = (type: ActiveFilter) => evidences.filter((e) => e.type === type).length;

  const gridClasses =
    filter === "badge"
      ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6";

  const emptyTitle =
    filter === "certificate"
      ? "Nenhum certificado ainda"
      : "Nenhuma badge ainda";
  const emptyDescription =
    filter === "certificate"
      ? "Conclua disciplinas com vínculo de conteúdo para emitir certificados automaticamente."
      : "Continue estudando — badges são liberadas conforme as regras de gamificação.";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Portfólio de Conquistas"
          description="Badges e certificados conquistados na plataforma."
        />

        <Tabs value={filter} onValueChange={handleFilterChange}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            {(Object.keys(filterConfig) as ActiveFilter[]).map((type) => {
              const config = filterConfig[type];
              const Icon = config.icon;
              return (
                <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="text-xs text-muted-foreground">({getCounts(type)})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <LoadingLearning type="grid" count={6} />
        ) : error ? (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar seu portfólio."
            description="Tente novamente para buscar suas evidências."
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
          />
        ) : sortedFiltered.length > 0 ? (
          <div className={gridClasses}>
            {sortedFiltered.map((evidence, index) => (
              <div
                key={evidence.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {filter === "badge" ? (
                  <GameBadge evidence={evidence} />
                ) : (
                  <CertificateEvidenceCard evidence={evidence} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <QueryStateCard
            state="empty"
            title={emptyTitle}
            description={emptyDescription}
            icon={BookOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
