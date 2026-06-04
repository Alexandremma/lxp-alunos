import { useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  GraduationCap,
  Trophy,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink } from "@/components/NavLink"
import { Separator } from "@/components/ui/separator"
import { useLogout } from "@/hooks/use-logout"
import { SidebarStudentGamification } from "@/components/layout/SidebarStudentGamification"

interface NavItem {
  title: string
  url: string
  icon: React.ElementType
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: "Ensino",
    items: [
      { title: "Início", url: "/", icon: LayoutDashboard },
      { title: "Meu Curso", url: "/meu-curso", icon: GraduationCap },
      { title: "Minhas Disciplinas", url: "/cursos-livres", icon: Sparkles },
      { title: "Progresso", url: "/progress", icon: BarChart3 },
      { title: "Portfólio", url: "/portfolio", icon: Trophy },
    ],
  },
  // {
  //   label: "Secretaria",
  //   items: [
  //     { title: "Documentos", url: "/secretaria/documentos", icon: FileText },
  //     { title: "Financeiro", url: "/secretaria/financeiro", icon: CreditCard },
  //     { title: "Matrícula", url: "/secretaria/matricula", icon: ClipboardList },
  //     { title: "Atendimento", url: "/secretaria/atendimento", icon: HeadphonesIcon },
  //   ],
  // },
]

interface AppSidebarProps {
  collapsed?: boolean
  className?: string
}

const AppSidebar = ({ collapsed = false, className }: AppSidebarProps) => {
  const location = useLocation()
  const { logout } = useLogout()

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">PA</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-sm text-sidebar-foreground truncate">
              Portal do Aluno
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">Ensino Superior</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col min-h-0 p-3">
        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/"}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      collapsed && "justify-center px-2"
                    )}
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                ))}
              </div>
              {sectionIndex < navSections.length - 1 && (
                <Separator className="mt-4 bg-sidebar-border" />
              )}
            </div>
          ))}
        </div>

        <div className={cn("shrink-0 pt-3", collapsed ? "flex justify-center" : "")}>
          <SidebarStudentGamification collapsed={collapsed} />
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full",
            "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={() => {
            void logout()
          }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}

export { AppSidebar }
