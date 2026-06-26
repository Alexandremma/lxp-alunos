import { PanelLeftClose, PanelLeftOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/profile/UserAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useLogout } from "@/hooks/use-logout"
import { useAuth } from "@/hooks/use-auth"
import { useTeamModeration } from "@/hooks/useTeamModeration"
import { Badge } from "@/components/ui/badge"

interface TopBarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

const TopBar = ({ isSidebarOpen, onToggleSidebar }: TopBarProps) => {
  const navigate = useNavigate()
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
              <UserAvatar
                name={menuName}
                avatarPath={profile?.avatar_path}
                updatedAt={profile?.updated_at}
                className="h-9 w-9"
                fallbackClassName="bg-primary text-primary-foreground"
              />
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
              onSelect={(e) => {
                e.preventDefault()
                navigate("/perfil")
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
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
