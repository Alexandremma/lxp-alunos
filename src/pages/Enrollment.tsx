import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  BookOpen,
  GraduationCap,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  enrollmentStatus, 
  mainCourse, 
  currentStudent, 
  getCourseProgress 
} from "@/data/mockData";

const statusConfig = {
  active: { label: "Ativa", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  locked: { label: "Trancada", color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  graduated: { label: "Formado", color: "bg-primary/10 text-primary border-primary/20", icon: GraduationCap },
  suspended: { label: "Suspensa", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
};

const Enrollment = () => {
  const StatusIcon = statusConfig[enrollmentStatus.status].icon;
  const courseProgress = getCourseProgress();
  const currentPeriod = mainCourse.periods.find((p) => p.status === "current");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Matrícula"
          description="Visualize o status da sua matrícula e informações do período letivo atual."
        />

        {/* Enrollment Status Card */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-4 rounded-xl",
                  statusConfig[enrollmentStatus.status].color
                )}>
                  <StatusIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Matrícula {enrollmentStatus.status === "active" ? "Ativa" : statusConfig[enrollmentStatus.status].label}</h2>
                    <Badge variant="outline" className={statusConfig[enrollmentStatus.status].color}>
                      {statusConfig[enrollmentStatus.status].label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    RA: {currentStudent.registration} • Período {enrollmentStatus.semester}
                  </p>
                </div>
              </div>
              
              {enrollmentStatus.canRenew && (
                <Button size="lg">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Realizar Rematrícula
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Data de Matrícula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Date(enrollmentStatus.enrollmentDate).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-muted-foreground">Período {enrollmentStatus.semester}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Período de Rematrícula
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentStatus.renewalStart && enrollmentStatus.renewalEnd ? (
                <>
                  <p className="text-lg font-bold">
                    {new Date(enrollmentStatus.renewalStart).toLocaleDateString("pt-BR")} - {new Date(enrollmentStatus.renewalEnd).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {enrollmentStatus.canRenew ? "Período aberto" : "Aguardando período"}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Não definido</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Progresso do Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{courseProgress}%</p>
              <Progress value={courseProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Current Period */}
        {currentPeriod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Disciplinas do Período Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPeriod.subjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-sm text-muted-foreground">({subject.code})</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{subject.credits} créditos</span>
                        <span>•</span>
                        <span>{subject.workload}h</span>
                        {subject.professor && (
                          <>
                            <span>•</span>
                            <span>{subject.professor}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Cursando</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Curso</p>
                  <p className="font-medium">{mainCourse.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modalidade</p>
                  <p className="font-medium">
                    {mainCourse.type === "graduation" ? "Graduação - Bacharelado" : "Pós-Graduação"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período Atual</p>
                  <p className="font-medium">{mainCourse.currentPeriod}º de {mainCourse.totalPeriods} períodos</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-mail Institucional</p>
                  <p className="font-medium">{currentStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registro Acadêmico (RA)</p>
                  <p className="font-medium">{currentStudent.registration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Ingresso</p>
                  <p className="font-medium">
                    {new Date(currentStudent.enrolledAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Enrollment;
