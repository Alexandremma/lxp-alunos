import { useParams, Link, useNavigate } from "react-router-dom";
import { Upload, File, X, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

// Mock data
const mockProject = {
    courseTitle: "Introdução ao Desenvolvimento Web",
    lessonTitle: "Projeto Final: Criar um Site Responsivo",
    description: "Crie um site responsivo utilizando HTML, CSS e JavaScript básico.",
    requirements: [
        "Pelo menos 3 páginas",
        "Design responsivo (mobile-first)",
        "Uso de CSS Grid ou Flexbox",
        "Interatividade com JavaScript",
    ],
    acceptedFormats: [".zip", ".rar", ".pdf"],
    maxSize: 50, // MB
    dueDate: "2024-02-20",
};

export default function ProjectUpload() {
    const { trailId, lessonId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploaded, setUploaded] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validar tamanho
        const fileSizeMB = selectedFile.size / (1024 * 1024);
        if (fileSizeMB > mockProject.maxSize) {
            toast.error(`Arquivo muito grande. Tamanho máximo: ${mockProject.maxSize}MB`);
            return;
        }

        // Validar formato
        const fileExt = "." + selectedFile.name.split(".").pop()?.toLowerCase();
        if (!mockProject.acceptedFormats.includes(fileExt)) {
            toast.error(`Formato não aceito. Use: ${mockProject.acceptedFormats.join(", ")}`);
            return;
        }

        setFile(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        // Simular upload
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    setUploaded(true);
                    toast.success("Projeto enviado com sucesso! 🎉");
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to={`/trails/${trailId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <PageHeader
                        title="Enviar Projeto"
                        description="Envie seu projeto final para avaliação"
                    />
                </div>

                {/* Project Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{mockProject.lessonTitle}</CardTitle>
                        <CardDescription>{mockProject.courseTitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Descrição:</p>
                            <p className="text-sm">{mockProject.description}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Requisitos:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {mockProject.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                                Prazo: {new Date(mockProject.dueDate).toLocaleDateString("pt-BR")}
                            </Badge>
                            <Badge variant="outline">
                                Tamanho máx: {mockProject.maxSize}MB
                            </Badge>
                            <Badge variant="outline">
                                Formatos: {mockProject.acceptedFormats.join(", ")}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Area */}
                {!uploaded ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Selecionar Arquivo</CardTitle>
                            <CardDescription>
                                Escolha o arquivo do seu projeto para enviar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!file ? (
                                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept={mockProject.acceptedFormats.join(",")}
                                        onChange={handleFileSelect}
                                    />
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <div className="p-4 rounded-full bg-primary/10">
                                                <Upload className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Clique para selecionar ou arraste o arquivo aqui
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {mockProject.acceptedFormats.join(", ")} • Máx. {mockProject.maxSize}MB
                                            </p>
                                        </div>
                                        <label htmlFor="file-upload" className="inline-block">
                                            <Button variant="outline" type="button" className="cursor-pointer">
                                                Selecionar Arquivo
                                            </Button>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* File Info */}
                                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/50">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <File className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveFile}
                                            disabled={uploading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Upload Progress */}
                                    {uploading && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Enviando...</span>
                                                <span className="font-medium">{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="flex-1"
                                        >
                                            {uploading ? "Enviando..." : "Enviar Projeto"}
                                        </Button>
                                        {!uploading && (
                                            <Button
                                                variant="outline"
                                                onClick={handleRemoveFile}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-success/20 bg-success/5">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-full bg-success/10">
                                    <CheckCircle2 className="h-6 w-6 text-success" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-semibold">Projeto enviado com sucesso!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Seu projeto foi recebido e está aguardando avaliação. Você receberá
                                        uma notificação quando a avaliação estiver disponível.
                                    </p>
                                    <div className="pt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/trails/${trailId}`)}
                                        >
                                            Voltar para a Trilha
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setFile(null);
                                                setUploaded(false);
                                                setUploadProgress(0);
                                            }}
                                        >
                                            Enviar Outro Arquivo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Dica:</strong> Certifique-se de que seu arquivo contém todos os
                        arquivos necessários do projeto. Se estiver enviando um ZIP, verifique
                        que ele pode ser extraído corretamente.
                    </AlertDescription>
                </Alert>
            </div>
        </DashboardLayout>
    );
}
