import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { documents, type Document } from "@/data/mockData";

const statusConfig = {
  available: { 
    label: "Disponível", 
    color: "bg-success/10 text-success border-success/20", 
    icon: CheckCircle,
    action: "Solicitar"
  },
  requested: { 
    label: "Solicitado", 
    color: "bg-warning/10 text-warning border-warning/20", 
    icon: Clock,
    action: "Aguardando"
  },
  ready: { 
    label: "Pronto", 
    color: "bg-primary/10 text-primary border-primary/20", 
    icon: FileCheck,
    action: "Baixar"
  },
  delivered: { 
    label: "Entregue", 
    color: "bg-muted text-muted-foreground border-muted", 
    icon: CheckCircle,
    action: "Baixar Novamente"
  },
};

const typeConfig = {
  declaration: { label: "Declaração", icon: FileText },
  transcript: { label: "Histórico", icon: FileText },
  certificate: { label: "Atestado", icon: FileText },
  enrollment: { label: "Comprovante", icon: FileText },
};

const DocumentCard = ({ doc }: { doc: Document }) => {
  const StatusIcon = statusConfig[doc.status].icon;
  const TypeIcon = typeConfig[doc.type].icon;

  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <TypeIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{doc.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
              
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={statusConfig[doc.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[doc.status].label}
                </Badge>
                {doc.price !== undefined && doc.price > 0 && (
                  <span className="text-sm text-muted-foreground">
                    R$ {doc.price.toFixed(2)}
                  </span>
                )}
                {doc.price === 0 && (
                  <span className="text-sm text-success">Gratuito</span>
                )}
              </div>

              {doc.requestedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Solicitado em: {new Date(doc.requestedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
              {doc.readyAt && (
                <p className="text-xs text-success mt-1">
                  Pronto desde: {new Date(doc.readyAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>

          <Button 
            variant={doc.status === "ready" ? "default" : doc.status === "available" ? "secondary" : "outline"}
            size="sm"
            disabled={doc.status === "requested"}
          >
            {doc.status === "ready" || doc.status === "delivered" ? (
              <Download className="h-4 w-4 mr-1" />
            ) : null}
            {statusConfig[doc.status].action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Documents = () => {
  const readyDocs = documents.filter((d) => d.status === "ready").length;
  const requestedDocs = documents.filter((d) => d.status === "requested").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Documentos"
          description="Solicite e baixe documentos acadêmicos como declarações, históricos e atestados."
        />

        {/* Alert for ready documents */}
        {readyDocs > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-primary" />
              <p className="text-sm">
                <span className="font-medium">Você tem {readyDocs} documento(s) pronto(s)</span> para download.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">Total Disponíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{requestedDocs}</div>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{readyDocs}</div>
              <p className="text-xs text-muted-foreground">Prontos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {documents.filter((d) => d.price === 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Gratuitos</p>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Documentos Disponíveis</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
