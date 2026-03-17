import { useParams, Link } from "react-router-dom";
import { Download, Share2, ArrowLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Mock data
const mockCertificate = {
    id: "cert-001",
    courseTitle: "Introdução ao Desenvolvimento Web",
    studentName: "Ana Carolina Silva",
    issuedAt: "2024-01-15",
    codeHash: "B42-2024-ABC123XYZ",
    instructor: "Prof. João Santos",
};

export default function Certificate() {
    const { courseId } = useParams();

    const handleDownload = () => {
        toast.success("Download iniciado!");
        // Simular download
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link to="/portfolio">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleShare} className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Compartilhar
                        </Button>
                        <Button onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Certificate */}
                <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
                    <CardContent className="p-0">
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary h-32 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNFYyNmMwLTIuMjA5IDEuNzkxLTQgNC00czQgMS43OTEgNCA4em0wIDBjMCAyLjIwOSAxLjc5MSA0IDQgNHM0LTEuNzkxIDQtNFYyNmMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgOHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
                            <div className="absolute top-4 right-4">
                                <Award className="h-16 w-16 text-white/20" />
                            </div>
                        </div>

                        {/* Certificate Content */}
                        <div className="p-8 md:p-12 text-center space-y-8 bg-card">
                            {/* Logo/Brand */}
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-primary/10">
                                    <Award className="h-12 w-12 text-primary" />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                                    Certificado de Conclusão
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Certificamos que
                                </p>
                            </div>

                            {/* Student Name */}
                            <div className="py-4">
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
                                    {mockCertificate.studentName}
                                </h2>
                            </div>

                            {/* Course Info */}
                            <div className="space-y-2">
                                <p className="text-muted-foreground">
                                    concluiu com sucesso o curso
                                </p>
                                <h3 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                                    {mockCertificate.courseTitle}
                                </h3>
                            </div>

                            <Separator className="my-8" />

                            {/* Details */}
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Data de Emissão</p>
                                    <p className="font-medium">
                                        {new Date(mockCertificate.issuedAt).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Código do Certificado</p>
                                    <p className="font-mono font-medium">{mockCertificate.codeHash}</p>
                                </div>
                            </div>

                            {/* Signature Area */}
                            <div className="pt-8 space-y-4">
                                <Separator />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <div className="h-16 border-b-2 border-foreground/20"></div>
                                        <p className="text-sm text-muted-foreground">
                                            {mockCertificate.instructor}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Instrutor</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-16 border-b-2 border-foreground/20"></div>
                                        <p className="text-sm text-muted-foreground">B42 Edtech</p>
                                        <p className="text-xs text-muted-foreground">Instituição</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Este certificado pode ser verificado através do código único acima
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Sobre este certificado</h3>
                            <p className="text-sm text-muted-foreground">
                                Este certificado comprova a conclusão do curso e pode ser compartilhado
                                em seu portfólio profissional. O código único permite verificação da
                                autenticidade do documento.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
