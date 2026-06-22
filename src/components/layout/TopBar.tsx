import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo } from "react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useLogout } from "@/hooks/use-logout"
import { useAuth } from "@/hooks/use-auth"
import { useTeamModeration } from "@/hooks/useTeamModeration"
import { Badge } from "@/components/ui/badge"

function initialsFromDisplay(label: string): string {
  const t = label.trim()
  if (!t) return "?"
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

interface TopBarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

const TopBar = ({ isSidebarOpen, onToggleSidebar }: TopBarProps) => {
  const { logout } = useLogout()
  const { profile, user } = useAuth()
  const { isModerator, teamRoleLabel } = useTeamModeration()

  const menuName = useMemo(() => {
    const fromProfile = profile?.name?.trim()
    if (fromProfile) return fromProfile
    const meta = user?.user_metadata?.full_name
    if (typeof meta === "string" && meta.trim()) return meta.trim()
    const email = user?.email?.trim()
    if (email) return email.split("@")[0] ?? email
    return "Aluno"
  }, [profile?.name, user])

  const menuEmail = useMemo(
    () => profile?.email?.trim() || user?.email?.trim() || "",
    [profile?.email, user?.email],
  )

  const avatarInitials = useMemo(
    () => initialsFromDisplay(menuName === "Aluno" && menuEmail ? menuEmail : menuName),
    [menuName, menuEmail],
  )

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="shrink-0 text-muted-foreground"
        aria-label={isSidebarOpen ? "Recolher menu lateral" : "Abrir menu lateral"}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </Button>

      <div className="flex items-center gap-2">
        {isModerator && teamRoleLabel ? (
          <Badge variant="outline" className="hidden sm:inline-flex">
            Moderação · {teamRoleLabel}
          </Badge>
        ) : null}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt={menuName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{menuName}</p>
                <p className="text-xs text-muted-foreground">
                  {menuEmail || "—"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={(e) => {
                e.preventDefault()
                void logout()
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export { TopBar }
