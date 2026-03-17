import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, Inbox, Search, FileX, Users, FolderOpen } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-built empty state variants
const EmptyStateNoResults = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description="Try adjusting your search or filter to find what you're looking for."
    {...props}
  />
)

const EmptyStateNoData = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={FileX}
    title="No data available"
    description="There's no data to display at the moment."
    {...props}
  />
)

const EmptyStateNoUsers = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={Users}
    title="No users yet"
    description="Start by adding your first user to the system."
    {...props}
  />
)

const EmptyStateNoItems = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    icon={FolderOpen}
    title="No items"
    description="Get started by creating your first item."
    {...props}
  />
)

export { 
  EmptyState, 
  EmptyStateNoResults, 
  EmptyStateNoData, 
  EmptyStateNoUsers, 
  EmptyStateNoItems 
}
