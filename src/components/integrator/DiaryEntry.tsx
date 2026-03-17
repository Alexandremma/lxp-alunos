import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DiaryEntry as DiaryEntryType } from '@/data/integratorMockData';
import { useState } from 'react';

interface DiaryEntryProps {
  entry: DiaryEntryType;
}

export function DiaryEntry({ entry }: DiaryEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(entry.createdAt);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(date, "HH:mm", { locale: ptBR });

  const hasQuestions = entry.guidingQuestions && 
    (entry.guidingQuestions.progress || entry.guidingQuestions.challenges || entry.guidingQuestions.learnings);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
          <Badge variant="outline" className="text-xs">
            {formattedTime}
          </Badge>
        </div>

        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </p>

        {hasQuestions && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span>Perguntas-guia</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 pl-6 border-l-2 border-primary/20">
              {entry.guidingQuestions?.progress && (
                <div>
                  <p className="text-xs font-medium text-primary mb-1">O que avancei hoje?</p>
                  <p className="text-sm text-muted-foreground">{entry.guidingQuestions.progress}</p>
                </div>
              )}
              {entry.guidingQuestions?.challenges && (
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Quais desafios encontrei?</p>
                  <p className="text-sm text-muted-foreground">{entry.guidingQuestions.challenges}</p>
                </div>
              )}
              {entry.guidingQuestions?.learnings && (
                <div>
                  <p className="text-xs font-medium text-primary mb-1">O que aprendi neste processo?</p>
                  <p className="text-sm text-muted-foreground">{entry.guidingQuestions.learnings}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
