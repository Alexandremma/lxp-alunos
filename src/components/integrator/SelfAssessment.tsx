import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { SelfAssessment as SelfAssessmentType } from '@/data/integratorMockData';
import { cn } from '@/lib/utils';

interface SelfAssessmentProps {
  disabled?: boolean;
}

const assessmentCriteria = [
  { key: 'organization', label: 'Organização', description: 'Capacidade de planejar e organizar as atividades do projeto' },
  { key: 'learning', label: 'Aprendizado', description: 'Evolução do conhecimento ao longo do projeto' },
  { key: 'dedication', label: 'Dedicação', description: 'Empenho e comprometimento com o projeto' },
  { key: 'collaboration', label: 'Colaboração', description: 'Contribuição para o trabalho em equipe (se aplicável)' }
];

export function SelfAssessment({ disabled = false }: SelfAssessmentProps) {
  const [assessment, setAssessment] = useState<SelfAssessmentType>({
    organization: 0,
    learning: 0,
    dedication: 0,
    collaboration: 0,
    reflection: ''
  });

  const handleRatingChange = (key: string, value: number) => {
    setAssessment({ ...assessment, [key]: value });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          Autoavaliação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Scales */}
        <div className="space-y-4">
          {assessmentCriteria.map((criteria) => (
            <div key={criteria.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{criteria.label}</Label>
                <span className="text-sm text-muted-foreground">
                  {assessment[criteria.key as keyof SelfAssessmentType] || '-'}/5
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{criteria.description}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingChange(criteria.key, value)}
                    disabled={disabled}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center",
                      assessment[criteria.key as keyof SelfAssessmentType] === value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border/50 hover:border-primary/50 text-muted-foreground",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Star 
                      className={cn(
                        "h-5 w-5",
                        (assessment[criteria.key as keyof SelfAssessmentType] as number) >= value 
                          ? "fill-primary text-primary" 
                          : ""
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reflection */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <Label className="font-medium">Reflexão Final</Label>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Se eu refizesse este Projeto Integrador, o que faria diferente?
          </p>
          <Textarea
            placeholder="Reflita sobre sua jornada e compartilhe o que você faria diferente se pudesse recomeçar..."
            value={assessment.reflection}
            onChange={(e) => setAssessment({ ...assessment, reflection: e.target.value })}
            className="min-h-[120px]"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
