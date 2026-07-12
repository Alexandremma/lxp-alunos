import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { type MyCourseSubject } from "@/types/myCourse";

/** Disciplinas vindas do Supabase usam UUID; o mock antigo não — só linkamos quando for UUID. */
const DISCIPLINE_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const subjectStatusConfig = {
  approved: { label: "Aprovado", color: "bg-success/10 text-success" },
  in_progress: { label: "Cursando", color: "bg-primary/10 text-primary" },
  pending: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  failed: { label: "Reprovado", color: "bg-destructive/10 text-destructive" },
};

export const subjectUsesCredits = (subject: MyCourseSubject) => subject.creditsEnabled !== false;

type SubjectRowProps = {
  subject: MyCourseSubject;
};

export const SubjectRow = ({ subject }: SubjectRowProps) => {
  const noContentLink = subject.hasContentLink === false;
  const blocked =
    subject.disciplineInactive || subject.enrollmentInactive || noContentLink;
  const canOpenDisciplineTrail = DISCIPLINE_UUID_RE.test(subject.id) && !blocked;

  const row = (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-colors",
        blocked
          ? "border border-dashed border-warning/40 bg-warning/5 cursor-not-allowed opacity-80"
          : "bg-muted/30",
        canOpenDisciplineTrail && "hover:bg-muted/60",
      )}
      aria-disabled={blocked || undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "font-medium text-sm",
              canOpenDisciplineTrail && "group-hover:text-primary transition-colors",
              blocked && "text-muted-foreground",
            )}
          >
            {subject.name}
          </span>
          <span className="text-xs text-muted-foreground">({subject.code})</span>
          {canOpenDisciplineTrail && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Abrir disciplina
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
          {subjectUsesCredits(subject) && (
            <span>{subject.credits} créditos</span>
          )}
          {subject.workload > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {subject.workload}h
            </span>
          )}
          {subject.professor?.trim() && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 shrink-0" />
              {subject.professor}
            </span>
          )}
        </div>
        {noContentLink && !subject.disciplineInactive && !subject.enrollmentInactive && (
          <p className="mt-2 text-xs text-muted-foreground">
            Conteúdo em preparação. As aulas ficarão disponíveis quando a instituição vincular o material externo.
          </p>
        )}
        {subject.disciplineInactive && (
          <p className="mt-2 text-xs text-warning">
            Esta disciplina está inativa. O acesso às aulas ficará disponível quando a instituição reativá-la.
          </p>
        )}
        {subject.enrollmentInactive && !subject.disciplineInactive && (
          <p className="mt-2 text-xs text-destructive">
            Sua matrícula neste curso está inativa. Você não pode acessar as disciplinas até a reativação.
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {noContentLink && !subject.disciplineInactive && !subject.enrollmentInactive ? (
          <Badge variant="outline" className="bg-muted text-muted-foreground shrink-0">
            Em preparação
          </Badge>
        ) : subject.disciplineInactive ? (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 shrink-0">
            Disciplina inativa
          </Badge>
        ) : subject.enrollmentInactive ? (
          <Badge variant="outline" className="bg-destructive/10 text-destructive shrink-0">
            Matrícula inativa
          </Badge>
        ) : (
          <Badge variant="outline" className={subjectStatusConfig[subject.status].color}>
            {subjectStatusConfig[subject.status].label}
          </Badge>
        )}
      </div>
    </div>
  );

  if (canOpenDisciplineTrail) {
    return (
      <Link
        to={`/trails/${subject.id}`}
        className="block rounded-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {row}
      </Link>
    );
  }

  return <div className="rounded-lg">{row}</div>;
};
