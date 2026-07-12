import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type MyCoursePeriod } from "@/types/myCourse";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SubjectRow, subjectUsesCredits } from "@/components/my-course/SubjectRow";

const statusConfig = {
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  current: { label: "Em Curso", color: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  future: { label: "Futuro", color: "bg-muted text-muted-foreground border-muted", icon: BookOpen },
};

type PeriodCardProps = {
  period: MyCoursePeriod;
};

export const PeriodCard = ({ period }: PeriodCardProps) => {
  const [isOpen, setIsOpen] = useState(period.status === "current");
  const StatusIcon = statusConfig[period.status].icon;

  const totalCredits = period.subjects.reduce(
    (acc, s) => acc + (subjectUsesCredits(s) ? s.credits : 0),
    0,
  );
  const approvedSubjects = period.subjects.filter((s) => s.status === "approved").length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-all duration-200",
        period.status === "current" && "border-primary/30 shadow-md"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  statusConfig[period.status].color
                )}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{period.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {period.subjects.length} disciplinas
                    {totalCredits > 0 && ` • ${totalCredits} créditos`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {period.status === "completed" && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {approvedSubjects}/{period.subjects.length} aprovadas
                  </Badge>
                )}
                {period.status === "current" && (
                  <Badge className="bg-primary text-primary-foreground">
                    Período Atual
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-3">
            <div className="space-y-2">
              {period.subjects.map((subject) => (
                <SubjectRow key={subject.id} subject={subject} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
