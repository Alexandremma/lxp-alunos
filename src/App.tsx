import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/AuthProvider";
import { XpRulesRealtimeSync } from "@/components/gamification/XpRulesRealtimeSync";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MyCourse from "./pages/MyCourse";
import MyCourses from "./pages/MyCourses";
import MyCourseRedirect from "./pages/MyCourseRedirect";
import FreeCourses from "./pages/FreeCourses";
import TrailDetail from "./pages/TrailDetail";
import Lesson from "./pages/Lesson";
import Progress from "./pages/Progress";
import Portfolio from "./pages/Portfolio";
import KitchenSink from "./pages/KitchenSink";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import Certificate from "./pages/Certificate";
import ProjectUpload from "./pages/ProjectUpload";
import AliceLaunchTest from "./pages/AliceLaunchTest";
import ValidateCertificate from "./pages/ValidateCertificate";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <XpRulesRealtimeSync />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Autenticação */}
              <Route path="/login" element={<Login />} />
              <Route path="/definir-senha" element={<SetPassword />} />
              <Route path="/validar-certificado" element={<ValidateCertificate />} />

              {/* Ensino (aluno autenticado) */}
              <Route
                path="/"
                element={<ProtectedRoute element={<Dashboard />} access="student" />}
              />
              <Route
                path="/meus-cursos"
                element={<ProtectedRoute element={<MyCourses />} access="student" />}
              />
              <Route
                path="/meu-curso"
                element={<ProtectedRoute element={<MyCourseRedirect />} access="student" />}
              />
              <Route
                path="/meu-curso/:courseId"
                element={<ProtectedRoute element={<MyCourse />} access="student" />}
              />
              <Route
                path="/cursos-livres"
                element={<ProtectedRoute element={<FreeCourses />} access="studentOrTeamModerator" />}
              />
              <Route
                path="/trails"
                element={<ProtectedRoute element={<Navigate to="/cursos-livres" replace />} access="studentOrTeamModerator" />}
              />
              <Route
                path="/trails/:id"
                element={<ProtectedRoute element={<TrailDetail />} access="studentOrTeamModerator" />}
              />
              <Route
                path="/trails/:trailId/lesson/:lessonId"
                element={<ProtectedRoute element={<Lesson />} access="studentOrTeamModerator" />}
              />
              <Route
                path="/progress"
                element={<ProtectedRoute element={<Progress />} access="student" />}
              />
              <Route
                path="/portfolio"
                element={<ProtectedRoute element={<Portfolio />} access="student" />}
              />
              {/* Novas páginas */}
              <Route
                path="/certificado/:courseId"
                element={<ProtectedRoute element={<Certificate />} access="student" />}
              />
              <Route
                path="/trails/:trailId/project/:lessonId"
                element={<ProtectedRoute element={<ProjectUpload />} access="student" />}
              />

              {/* Teste integração Alice no domínio deployado (whitelist B42) */}
              <Route path="/teste-alice" element={<AliceLaunchTest />} />

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
