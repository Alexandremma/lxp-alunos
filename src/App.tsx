import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MyCourse from "./pages/MyCourse";
import FreeCourses from "./pages/FreeCourses";
import TrailDetail from "./pages/TrailDetail";
import Lesson from "./pages/Lesson";
import Progress from "./pages/Progress";
import Portfolio from "./pages/Portfolio";
import Documents from "./pages/Documents";
import Financial from "./pages/Financial";
import Enrollment from "./pages/Enrollment";
import Support from "./pages/Support";
import KitchenSink from "./pages/KitchenSink";
import IntegratorProjects from "./pages/IntegratorProjects";
import IntegratorProject from "./pages/IntegratorProject";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Certificate from "./pages/Certificate";
import ProjectUpload from "./pages/ProjectUpload";
import CoursesManagement from "./pages/admin/CoursesManagement";
import StudentsManagement from "./pages/admin/StudentsManagement";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Autenticação */}
              <Route path="/login" element={<Login />} />

              {/* Ensino (aluno autenticado) */}
              <Route
                path="/"
                element={<ProtectedRoute element={<Dashboard />} requiredRole="student" />}
              />
              <Route
                path="/meu-curso"
                element={<ProtectedRoute element={<MyCourse />} requiredRole="student" />}
              />
              <Route
                path="/cursos-livres"
                element={<ProtectedRoute element={<FreeCourses />} requiredRole="student" />}
              />
              <Route
                path="/trails/:id"
                element={<ProtectedRoute element={<TrailDetail />} requiredRole="student" />}
              />
              <Route
                path="/trails/:trailId/lesson/:lessonId"
                element={<ProtectedRoute element={<Lesson />} requiredRole="student" />}
              />
              <Route
                path="/progress"
                element={<ProtectedRoute element={<Progress />} requiredRole="student" />}
              />
              <Route
                path="/portfolio"
                element={<ProtectedRoute element={<Portfolio />} requiredRole="student" />}
              />
              <Route
                path="/projeto-integrador"
                element={
                  <ProtectedRoute
                    element={<IntegratorProjects />}
                    requiredRole="student"
                  />
                }
              />
              <Route
                path="/projeto-integrador/:id"
                element={
                  <ProtectedRoute
                    element={<IntegratorProject />}
                    requiredRole="student"
                  />
                }
              />

              {/* Novas páginas */}
              <Route
                path="/certificado/:courseId"
                element={<ProtectedRoute element={<Certificate />} requiredRole="student" />}
              />
              <Route
                path="/trails/:trailId/project/:lessonId"
                element={<ProtectedRoute element={<ProjectUpload />} requiredRole="student" />}
              />

              {/* Secretaria */}
              <Route
                path="/secretaria/documentos"
                element={<ProtectedRoute element={<Documents />} requiredRole="student" />}
              />
              <Route
                path="/secretaria/financeiro"
                element={<ProtectedRoute element={<Financial />} requiredRole="student" />}
              />
              <Route
                path="/secretaria/matricula"
                element={<ProtectedRoute element={<Enrollment />} requiredRole="student" />}
              />
              <Route
                path="/secretaria/atendimento"
                element={<ProtectedRoute element={<Support />} requiredRole="student" />}
              />

              {/* Back Office / Admin dentro do mesmo app (acesso admin) */}
              <Route
                path="/admin/cursos"
                element={<ProtectedRoute element={<CoursesManagement />} requiredRole="admin" />}
              />
              <Route
                path="/admin/alunos"
                element={<ProtectedRoute element={<StudentsManagement />} requiredRole="admin" />}
              />

              {/* Utils (pode manter livre ou proteger, aqui vou deixar livre para dev) */}
              <Route path="/kitchen-sink" element={<KitchenSink />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
