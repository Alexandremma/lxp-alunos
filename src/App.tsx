import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Autenticação */}
            <Route path="/login" element={<Login />} />

            {/* Ensino */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/meu-curso" element={<MyCourse />} />
            <Route path="/cursos-livres" element={<FreeCourses />} />
            <Route path="/trails/:id" element={<TrailDetail />} />
            <Route path="/trails/:trailId/lesson/:lessonId" element={<Lesson />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projeto-integrador" element={<IntegratorProjects />} />
            <Route path="/projeto-integrador/:id" element={<IntegratorProject />} />

            {/* Novas páginas */}
            <Route path="/certificado/:courseId" element={<Certificate />} />
            <Route path="/trails/:trailId/project/:lessonId" element={<ProjectUpload />} />

            {/* Secretaria */}
            <Route path="/secretaria/documentos" element={<Documents />} />
            <Route path="/secretaria/financeiro" element={<Financial />} />
            <Route path="/secretaria/matricula" element={<Enrollment />} />
            <Route path="/secretaria/atendimento" element={<Support />} />

            {/* Back Office / Admin */}
            <Route path="/admin/cursos" element={<CoursesManagement />} />
            <Route path="/admin/alunos" element={<StudentsManagement />} />

            {/* Utils */}
            <Route path="/kitchen-sink" element={<KitchenSink />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
