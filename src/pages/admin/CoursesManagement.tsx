import { useState } from "react";
import { Plus, Search, Edit, BookOpen, Users, TrendingUp, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminCourses, getAdminStats } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const CoursesManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<string | null>(null);

    const stats = getAdminStats();
    const categories = Array.from(new Set(adminCourses.map((c) => c.category)));

    const filteredCourses = adminCourses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (courseId: string) => {
        setEditingCourse(courseId);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        toast({
            title: editingCourse ? "Curso atualizado" : "Curso criado",
            description: "As alterações foram salvas com sucesso.",
        });
        setIsDialogOpen(false);
        setEditingCourse(null);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                            Gerenciamento de Cursos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie os cursos disponíveis na plataforma
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="glow-sm" onClick={() => setEditingCourse(null)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Curso
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCourse ? "Editar Curso" : "Adicionar Novo Curso"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingCourse
                                        ? "Atualize as informações do curso abaixo."
                                        : "Preencha os dados para adicionar um novo curso à plataforma."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Curso *</Label>
                                    <Input id="title" placeholder="Ex: Fundamentos de IA" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descreva o conteúdo do curso..."
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria *</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instructor">Instrutor *</Label>
                                        <Input id="instructor" placeholder="Nome do instrutor" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="b42_id">ID API B42</Label>
                                        <Input id="b42_id" placeholder="b42-ai-001" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="thumbnail">URL da Thumbnail</Label>
                                        <Input id="thumbnail" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="modules">Módulos</Label>
                                        <Input id="modules" type="number" placeholder="5" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lessons">Aulas</Label>
                                        <Input id="lessons" type="number" placeholder="24" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hours">Horas</Label>
                                        <Input id="hours" type="number" placeholder="40" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="xp">XP de Recompensa</Label>
                                    <Input id="xp" type="number" placeholder="500" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-primary/10">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
                                <p className="text-xs text-muted-foreground">Total de Cursos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-success/10">
                                <TrendingUp className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.activeCourses}</p>
                                <p className="text-xs text-muted-foreground">Cursos Ativos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-secondary/10">
                                <Users className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalEnrollments}</p>
                                <p className="text-xs text-muted-foreground">Matrículas Totais</p>
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
                                    placeholder="Buscar por título ou instrutor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as categorias</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cursos ({filteredCourses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Curso</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Instrutor</TableHead>
                                        <TableHead>Alunos</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={course.thumbnail_url}
                                                        alt={course.title}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{course.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {course.total_lessons} aulas • {course.estimated_hours}h
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{course.category}</Badge>
                                            </TableCell>
                                            <TableCell>{course.instructor}</TableCell>
                                            <TableCell>{course.enrolled_students}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        course.status === "active"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    {course.status === "active" ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(course.id)}
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CoursesManagement;
