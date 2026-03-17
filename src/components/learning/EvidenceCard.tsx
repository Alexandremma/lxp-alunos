import { ExternalLink, Share2, Trophy, Award, FolderKanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Evidence } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface EvidenceCardProps {
  evidence: Evidence;
  className?: string;
}

const typeConfig = {
  certificate: {
    icon: Trophy,
    label: "Certificado",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  project: {
    icon: FolderKanban,
    label: "Projeto",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  badge: {
    icon: Award,
    label: "Badge",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  participation: {
    icon: Users,
    label: "Participação",
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

export const EvidenceCard = ({ evidence, className }: EvidenceCardProps) => {
  const config = typeConfig[evidence.type];
  const Icon = config.icon;

  const handleShare = () => {
    if (evidence.shareUrl) {
      navigator.clipboard.writeText(evidence.shareUrl);
      toast.success("Link copiado para a área de transferência!");
    } else {
      toast.info("Link de compartilhamento não disponível");
    }
  };

  return (
    <Card className={cn("overflow-hidden card-hover group", className)}>
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={evidence.imageUrl || '/placeholder.svg'}
          alt={evidence.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        
        {/* Type Badge */}
        <Badge
          variant="secondary"
          className={cn("absolute top-3 left-3", config.bgColor, config.color)}
        >
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {evidence.title}
        </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {evidence.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {format(parseISO(evidence.earnedAt), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {evidence.shareUrl && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-primary"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
