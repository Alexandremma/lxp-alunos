import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AiTutorFabProps {
  onClick: () => void;
  className?: string;
}

export function AiTutorFab({ onClick, className }: AiTutorFabProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            "transition-all duration-300 hover:scale-105 hover:shadow-xl",
            className
          )}
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">Abrir Tutor IA</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Tutor IA</p>
      </TooltipContent>
    </Tooltip>
  );
}
