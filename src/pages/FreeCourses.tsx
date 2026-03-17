import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyLearning } from "@/components/states/EmptyLearning";
import { 
  Languages, 
  Lightbulb, 
  Award, 
  BookMarked,
  Clock,
  Users,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { freeCourses, mainCourse, type FreeCourse } from "@/data/mockData";

type FilterType = "all" | "course" | "language" | "workshop" | "certification" | "extension";

const categoryConfig = {
  course: { label: mainCourse.name, icon: GraduationCap, color: "bg-secondary/10 text-secondary border-secondary/20" },
  language: { label: "Idiomas", icon: Languages, color: "bg-info/10 text-info border-info/20" },
  workshop: { label: "Workshops", icon: Lightbulb, color: "bg-warning/10 text-warning border-warning/20" },
  certification: { label: "Certificações", icon: Award, color: "bg-success/10 text-success border-success/20" },
  extension: { label: "Extensão", icon: BookMarked, color: "bg-primary/10 text-primary border-primary/20" },
};

const statusConfig = {
  available: { label: "Disponível", color: "bg-muted text-muted-foreground" },
  enrolled: { label: "Matriculado", color: "bg-primary/10 text-primary" },
  completed: { label: "Concluído", color: "bg-success/10 text-success" },
};

const FreeCourseCard = ({ course }: { course: FreeCourse }) => {
  const CategoryIcon = categoryConfig[course.category].icon;

  return (
    <Card className="overflow-hidden card-hover group">
      <div className="relative h-40">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className={cn("backdrop-blur-sm", categoryConfig[course.category].color)}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {categoryConfig[course.category].label}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={statusConfig[course.status].color}>
            {statusConfig[course.status].label}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.workload}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.instructor}
          </span>
        </div>

        {course.status === "enrolled" && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        <Button 
          className="w-full" 
          variant={course.status === "available" ? "default" : course.status === "enrolled" ? "secondary" : "outline"}
        >
          {course.status === "available" && "Inscrever-se"}
          {course.status === "enrolled" && (
            <>
              Continuar
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
          {course.status === "completed" && "Ver Certificado"}
        </Button>
      </CardContent>
    </Card>
  );
};

const FreeCourses = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredCourses = freeCourses.filter((course) => {
    if (filter === "all") return true;
    return course.category === filter;
  });

  const counts = {
    all: freeCourses.length,
    course: freeCourses.filter((c) => c.category === "course").length,
    language: freeCourses.filter((c) => c.category === "language").length,
    workshop: freeCourses.filter((c) => c.category === "workshop").length,
    certification: freeCourses.filter((c) => c.category === "certification").length,
    extension: freeCourses.filter((c) => c.category === "extension").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Minhas Trilhas"
          description="Amplie seus conhecimentos com cursos de extensão, idiomas, workshops e certificações."
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {freeCourses.filter((c) => c.status === "enrolled").length}
              </div>
              <p className="text-xs text-muted-foreground">Cursando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {freeCourses.filter((c) => c.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {freeCourses
                  .filter((c) => c.status !== "available")
                  .reduce((acc, c) => acc + c.workload, 0)}h
              </div>
              <p className="text-xs text-muted-foreground">Horas Cursadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {freeCourses.filter((c) => c.status === "available").length}
              </div>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="course">
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              {mainCourse.name} ({counts.course})
            </TabsTrigger>
            <TabsTrigger value="language">Idiomas ({counts.language})</TabsTrigger>
            <TabsTrigger value="workshop">Workshops ({counts.workshop})</TabsTrigger>
            <TabsTrigger value="certification">Certificações ({counts.certification})</TabsTrigger>
            <TabsTrigger value="extension">Extensão ({counts.extension})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <FreeCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyLearning
            type="trails"
            title="Nenhum curso encontrado"
            description="Não há cursos nesta categoria. Tente outra."
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default FreeCourses;
