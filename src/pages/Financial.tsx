import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Copy,
  Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { financialItems, getFinancialSummary, type FinancialItem } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  paid: { 
    label: "Pago", 
    color: "bg-success/10 text-success border-success/20", 
    icon: CheckCircle 
  },
  pending: { 
    label: "Pendente", 
    color: "bg-warning/10 text-warning border-warning/20", 
    icon: Clock 
  },
  overdue: { 
    label: "Vencido", 
    color: "bg-destructive/10 text-destructive border-destructive/20", 
    icon: AlertTriangle 
  },
};

const FinancialRow = ({ item }: { item: FinancialItem }) => {
  const { toast } = useToast();
  const StatusIcon = statusConfig[item.status].icon;

  const copyBarcode = () => {
    if (item.barcode) {
      navigator.clipboard.writeText(item.barcode);
      toast({
        title: "Código copiado!",
        description: "O código de barras foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border",
      item.status === "overdue" && "border-destructive/30 bg-destructive/5",
      item.status === "pending" && "border-warning/30 bg-warning/5",
      item.status === "paid" && "border-border bg-card"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2 rounded-lg",
          item.status === "paid" ? "bg-success/10" : item.status === "overdue" ? "bg-destructive/10" : "bg-warning/10"
        )}>
          <Banknote className={cn(
            "h-5 w-5",
            item.status === "paid" ? "text-success" : item.status === "overdue" ? "text-destructive" : "text-warning"
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{item.description}</h3>
            <Badge variant="outline" className={statusConfig[item.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[item.status].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{item.reference}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Vencimento: {new Date(item.dueDate).toLocaleDateString("pt-BR")}
            {item.paidAt && (
              <span className="text-success ml-2">
                • Pago em {new Date(item.paidAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <div className="text-right">
          <p className={cn(
            "text-lg font-bold",
            item.status === "overdue" && "text-destructive",
            item.status === "pending" && "text-warning"
          )}>
            R$ {item.amount.toFixed(2)}
          </p>
        </div>
        {item.status !== "paid" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyBarcode}>
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-1" />
              Boleto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Financial = () => {
  const summary = getFinancialSummary();
  const totalPaid = financialItems
    .filter((f) => f.status === "paid")
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Financeiro"
          description="Acompanhe suas mensalidades, boletos e histórico de pagamentos."
        />

        {/* Alert for overdue */}
        {summary.overdueCount > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm">
                <span className="font-medium text-destructive">
                  Você tem {summary.overdueCount} boleto(s) vencido(s)
                </span>{" "}
                totalizando R$ {summary.overdueTotal.toFixed(2)}.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {summary.pendingTotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{summary.pendingCount} pendente(s)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {summary.overdueTotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{summary.overdueCount} vencido(s)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">R$ {totalPaid.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total pago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{financialItems.length}</p>
                  <p className="text-xs text-muted-foreground">Total de lançamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Items */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Histórico Financeiro</h2>
          <div className="space-y-3">
            {financialItems.map((item) => (
              <FinancialRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Financial;
