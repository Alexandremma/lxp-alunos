import { Bell, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useLogout } from "@/hooks/use-logout"
import { useAuth } from "@/hooks/use-auth"

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { logout } = useLogout()
  const { profile, user } = useAuth()

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

  useEffect(() => {
    setMounted(true)
  }, [])

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
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Novo conteúdo disponível</span>
              <span className="text-xs text-muted-foreground">
                Aula 6 de Metodologia Científica liberada
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Prazo se aproximando</span>
              <span className="text-xs text-muted-foreground">
                Entrega do projeto em 3 dias
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Certificado disponível</span>
              <span className="text-xs text-muted-foreground">
                Você completou o curso de Comunicação
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
            <DropdownMenuItem asChild>
              <Link to="/portfolio?tab=certificados" className="cursor-pointer">
                Meus Certificados
              </Link>
            </DropdownMenuItem>
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
