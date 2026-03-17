import { useState } from "react";
import { Search, Link2, Unlink, Eye, CheckCircle2, XCircle, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    adminStudents,
    externalEnrollments,
    searchExternalEnrollments,
    getAdminStats,
} from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const StudentsManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [enrollmentSearch, setEnrollmentSearch] = useState("");
    const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null);

    const stats = getAdminStats();

    const filteredStudents = adminStudents.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "linked" && student.enrollment_status === "linked") ||
            (statusFilter === "not_linked" && student.enrollment_status === "not_linked");
        return matchesSearch && matchesStatus;
    });

    const enrollmentResults = enrollmentSearch
        ? searchExternalEnrollments(enrollmentSearch)
        : [];

    const handleLinkEnrollment = () => {
        if (!selectedStudent || !selectedEnrollment) return;

        toast({
            title: "Vínculo criado",
            description: "O aluno foi vinculado à matrícula e os cursos foram adicionados automaticamente.",
        });
        setIsLinkDialogOpen(false);
        setSelectedEnrollment(null);
        setEnrollmentSearch("");
    };

    const handleUnlink = (studentId: string) => {
        toast({
            title: "Vínculo removido",
            description: "O vínculo com a matrícula externa foi removido.",
        });
    };

    const handleViewDetails = (studentId: string) => {
        setSelectedStudent(studentId);
        setIsDetailsDialogOpen(true);
    };

    const selectedStudentData = selectedStudent
        ? adminStudents.find((s) => s.id === selectedStudent)
        : null;

    const selectedEnrollmentData = selectedEnrollment
        ? externalEnrollments.find((e) => e.enrollment_id === selectedEnrollment)
        : null;

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                            Gerenciamento de Alunos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Vincule alunos cadastrados no LXP com matrículas da API externa
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-primary/10">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                                <p className="text-xs text-muted-foreground">Total de Alunos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-success/10">
                                <Link2 className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.linkedStudents}</p>
                                <p className="text-xs text-muted-foreground">Alunos Vinculados</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-warning/10">
                                <XCircle className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {stats.totalStudents - stats.linkedStudents}
                                </p>
                                <p className="text-xs text-muted-foreground">Não Vinculados</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome ou email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="linked">Vinculados</SelectItem>
                                    <SelectItem value="not_linked">Não Vinculados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Alunos ({filteredStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Aluno</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>XP / Nível</TableHead>
                                        <TableHead>Matrícula Externa</TableHead>
                                        <TableHead>Cursos</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={student.avatar_url} alt={student.name} />
                                                        <AvatarFallback>
                                                            {student.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Cadastrado em {new Date(student.created_at).toLocaleDateString("pt-BR")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{student.total_xp} XP</p>
                                                    <p className="text-xs text-muted-foreground">Nível {student.level}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.external_enrollment_id ? (
                                                    <Badge variant="outline" className="font-mono">
                                                        {student.external_enrollment_id}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{student.courses_count} cursos</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={student.enrollment_status === "linked" ? "default" : "outline"}
                                                >
                                                    {student.enrollment_status === "linked" ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Vinculado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Não Vinculado
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetails(student.id)}
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {student.enrollment_status === "linked" ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUnlink(student.id)}
                                                            title="Desvincular"
                                                        >
                                                            <Unlink className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Dialog
                                                            open={isLinkDialogOpen && selectedStudent === student.id}
                                                            onOpenChange={(open) => {
                                                                setIsLinkDialogOpen(open);
                                                                if (!open) {
                                                                    setSelectedStudent(null);
                                                                    setSelectedEnrollment(null);
                                                                    setEnrollmentSearch("");
                                                                }
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedStudent(student.id);
                                                                        setIsLinkDialogOpen(true);
                                                                    }}
                                                                    title="Vincular matrícula"
                                                                >
                                                                    <Link2 className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>Vincular Matrícula Externa</DialogTitle>
                                                                    <DialogDescription>
                                                                        Busque e selecione a matrícula do aluno na API externa. Os cursos
                                                                        associados serão adicionados automaticamente.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium">Aluno</label>
                                                                        <div className="p-3 bg-muted rounded-lg">
                                                                            <p className="font-medium">{student.name}</p>
                                                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium">
                                                                            Buscar Matrícula na API Externa
                                                                        </label>
                                                                        <div className="relative">
                                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                            <Input
                                                                                placeholder="Digite ID da matrícula, nome ou email..."
                                                                                value={enrollmentSearch}
                                                                                onChange={(e) => setEnrollmentSearch(e.target.value)}
                                                                                className="pl-10"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {enrollmentSearch && (
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">Resultados</label>
                                                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                                                {enrollmentResults.length > 0 ? (
                                                                                    enrollmentResults.map((enrollment) => (
                                                                                        <div
                                                                                            key={enrollment.id}
                                                                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedEnrollment === enrollment.enrollment_id
                                                                                                    ? "border-primary bg-primary/5"
                                                                                                    : "border-border hover:bg-muted"
                                                                                                }`}
                                                                                            onClick={() => setSelectedEnrollment(enrollment.enrollment_id)}
                                                                                        >
                                                                                            <div className="flex items-start justify-between">
                                                                                                <div>
                                                                                                    <p className="font-medium">{enrollment.student_name}</p>
                                                                                                    <p className="text-sm text-muted-foreground">
                                                                                                        Matrícula: {enrollment.enrollment_id}
                                                                                                    </p>
                                                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                                                        {enrollment.courses.length} curso(s) associado(s)
                                                                                                    </p>
                                                                                                </div>
                                                                                                {selectedEnrollment === enrollment.enrollment_id && (
                                                                                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                                                        Nenhum resultado encontrado
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {selectedEnrollmentData && (
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">Cursos que serão vinculados</label>
                                                                            <div className="p-3 bg-muted rounded-lg space-y-2">
                                                                                {selectedEnrollmentData.courses.map((course) => (
                                                                                    <div
                                                                                        key={course.id}
                                                                                        className="flex items-center justify-between p-2 bg-background rounded"
                                                                                    >
                                                                                        <div>
                                                                                            <p className="font-medium text-sm">{course.name}</p>
                                                                                            <p className="text-xs text-muted-foreground">
                                                                                                {course.code} • {course.semester}
                                                                                            </p>
                                                                                        </div>
                                                                                        <Badge variant="outline">{course.status}</Badge>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setIsLinkDialogOpen(false);
                                                                            setSelectedStudent(null);
                                                                            setSelectedEnrollment(null);
                                                                            setEnrollmentSearch("");
                                                                        }}
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleLinkEnrollment}
                                                                        disabled={!selectedEnrollment}
                                                                    >
                                                                        Vincular e Criar Matrículas
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Dialog */}
                <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalhes do Aluno</DialogTitle>
                            <DialogDescription>
                                Informações completas do aluno e seus cursos vinculados
                            </DialogDescription>
                        </DialogHeader>
                        {selectedStudentData && (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={selectedStudentData.avatar_url} alt={selectedStudentData.name} />
                                        <AvatarFallback>
                                            {selectedStudentData.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedStudentData.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedStudentData.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">XP Total</p>
                                        <p className="text-xl font-bold">{selectedStudentData.total_xp}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Nível</p>
                                        <p className="text-xl font-bold">{selectedStudentData.level}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Cursos</p>
                                        <p className="text-xl font-bold">{selectedStudentData.courses_count}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge
                                            variant={
                                                selectedStudentData.enrollment_status === "linked" ? "default" : "outline"
                                            }
                                        >
                                            {selectedStudentData.enrollment_status === "linked" ? "Vinculado" : "Não Vinculado"}
                                        </Badge>
                                    </div>
                                </div>
                                {selectedStudentData.external_enrollment_id && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Matrícula Externa</label>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="font-mono text-sm">{selectedStudentData.external_enrollment_id}</p>
                                            {selectedStudentData.linked_at && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Vinculado em {new Date(selectedStudentData.linked_at).toLocaleDateString("pt-BR")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                                Fechar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default StudentsManagement;
