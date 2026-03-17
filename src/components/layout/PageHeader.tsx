import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PageHeaderProps {
  title: string
  description?: string
  backButton?: boolean
  actions?: React.ReactNode
  className?: string
}

const PageHeader = ({
  title,
  description,
  backButton,
  actions,
  className,
}: PageHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {backButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mt-0.5"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export { PageHeader }
