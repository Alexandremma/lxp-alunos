import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameBadge } from "@/components/learning/GameBadge";
import { EvidenceCard } from "@/components/learning/EvidenceCard";
import { CertificateEvidenceCard } from "@/components/learning/CertificateEvidenceCard";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useAuth } from "@/hooks/use-auth";
import { usePortfolioEvidences } from "@/hooks/queries/usePortfolioEvidences";
import type { LearningEvidence } from "@/types/learningEvidence";
import { Award, BookOpen, Folder, GraduationCap, Users } from "lucide-react";

type FilterType = LearningEvidence["type"];

const filterConfig: Record<FilterType, { label: string; icon: React.ElementType }> = {
  badge: { label: "Badges", icon: Award },
  certificate: { label: "Certificados", icon: GraduationCap },
  project: { label: "Projetos", icon: Folder },
  participation: { label: "Participação", icon: Users },
};

const TAB_QUERY_BY_FILTER: Record<FilterType, string | null> = {
  badge: null,
  certificate: "certificados",
  project: "projetos",
  participation: "participacao",
};

function filterFromTabParam(tab: string | null): FilterType {
  switch (tab?.toLowerCase()) {
    case "certificados":
    case "certificate":
    case "certificado":
      return "certificate";
    case "badges":
    case "badge":
      return "badge";
    case "projetos":
    case "project":
    case "projeto":
      return "project";
    case "participacao":
    case "participação":
    case "participation":
      return "participation";
    default:
      return "badge";
  }
}

const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };

const Portfolio = () => {
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = usePortfolioEvidences(profile?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [filter, setFilter] = useState<FilterType>(() => filterFromTabParam(tabParam));

  useEffect(() => {
    setFilter(filterFromTabParam(tabParam));
  }, [tabParam]);

  const syncTabToUrl = useCallback(
    (next: FilterType) => {
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
      const next = v as FilterType;
      setFilter(next);
      syncTabToUrl(next);
    },
    [syncTabToUrl],
  );

  const evidences = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => evidences.filter((e) => e.type === filter), [evidences, filter]);

  // Sort badges by rarity, others by date
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

  const getCounts = (type: FilterType) => evidences.filter((e) => e.type === type).length;

  // Grid classes based on type
  const gridClasses =
    filter === "badge"
      ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Portfólio de Conquistas"
          description="Suas conquistas, certificados e projetos em um só lugar."
        />

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleFilterChange}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            {(Object.keys(filterConfig) as FilterType[]).map((type) => {
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
          <QueryStateCard state="loading" title="Carregando seu portfólio..." />
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
                ) : filter === "certificate" ? (
                  <CertificateEvidenceCard evidence={evidence} />
                ) : (
                  <EvidenceCard evidence={evidence} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <QueryStateCard
            state="empty"
            title="Seu portfólio ainda está vazio"
            description="Conclua disciplinas e aulas para gerar certificados e badges automaticamente."
            icon={BookOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
