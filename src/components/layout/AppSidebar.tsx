import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Trophy,
  BarChart3,
  LogOut,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { Separator } from "@/components/ui/separator";
import { useLogout } from "@/hooks/use-logout";
import { SidebarStudentGamification } from "@/components/layout/SidebarStudentGamification";
import { useTeamModeration } from "@/hooks/useTeamModeration";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const studentNavSections: NavSection[] = [
  {
    label: "Ensino",
    items: [
      { title: "Início", url: "/", icon: LayoutDashboard },
      { title: "Meus Cursos", url: "/meus-cursos", icon: GraduationCap },
      { title: "Minhas Disciplinas", url: "/cursos-livres", icon: Sparkles },
      { title: "Progresso", url: "/progress", icon: BarChart3 },
      { title: "Portfólio", url: "/portfolio", icon: Trophy },
    ],
  },
];

const moderatorNavSections: NavSection[] = [
  {
    label: "Moderação",
    items: [{ title: "Disciplinas", url: "/cursos-livres", icon: BookOpen }],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  className?: string;
}

const AppSidebar = ({ collapsed = false, className }: AppSidebarProps) => {
  const location = useLocation();
  const { logout } = useLogout();
  const { isModerator } = useTeamModeration();
  const navSections = isModerator ? moderatorNavSections : studentNavSections;

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

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
          collapsed ? "justify-center px-2" : "px-4 gap-3"
        )}
      >
        <GraduationCap className="h-7 w-7 text-primary shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-sm text-sidebar-foreground truncate">
              {isModerator ? "Moderação LXP" : "Portal do Aluno"}
            </h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {isModerator ? "Comentários nas aulas" : "Ensino Superior"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col min-h-0 p-3">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.url}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        collapsed && "justify-center px-2"
                      )}
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
              {sectionIndex < navSections.length - 1 && (
                <Separator className="mt-4 bg-sidebar-border" />
              )}
            </div>
          ))}
        </div>
      </nav>

      {!isModerator && !collapsed && (
        <div className="px-3 pb-3 shrink-0">
          <SidebarStudentGamification />
        </div>
      )}

      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          type="button"
          onClick={() => void logout()}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export { AppSidebar };
