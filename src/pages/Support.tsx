import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MessageSquare, 
  Plus, 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supportTickets, faqs, type SupportTicket } from "@/data/mockData";

const statusConfig = {
  open: { label: "Aberto", color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  in_progress: { label: "Em Análise", color: "bg-info/10 text-info border-info/20", icon: Clock },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  closed: { label: "Fechado", color: "bg-muted text-muted-foreground border-muted", icon: CheckCircle },
};

const categoryConfig = {
  academic: { label: "Acadêmico", color: "bg-primary/10 text-primary" },
  financial: { label: "Financeiro", color: "bg-warning/10 text-warning" },
  technical: { label: "Técnico", color: "bg-info/10 text-info" },
  general: { label: "Geral", color: "bg-muted text-muted-foreground" },
};

const TicketCard = ({ ticket }: { ticket: SupportTicket }) => {
  const StatusIcon = statusConfig[ticket.status].icon;

  return (
    <Card className="card-hover cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={categoryConfig[ticket.category].color}>
                {categoryConfig[ticket.category].label}
              </Badge>
              <Badge variant="outline" className={statusConfig[ticket.status].color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[ticket.status].label}
              </Badge>
            </div>
            <h3 className="font-medium">{ticket.subject}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span>#{ticket.id.split("-")[1]}</span>
              <span>•</span>
              <span>{ticket.messages.length} mensagens</span>
              <span>•</span>
              <span>
                Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const openTickets = supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const resolvedTickets = supportTickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <PageHeader
            title="Atendimento"
            description="Tire suas dúvidas ou abra um chamado para a secretaria."
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{supportTickets.length}</div>
              <p className="text-xs text-muted-foreground">Total de Chamados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{openTickets}</div>
              <p className="text-xs text-muted-foreground">Em Aberto</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              Perguntas Frequentes
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="h-4 w-4 mr-2" />
              Meus Chamados ({supportTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nas perguntas frequentes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card>
              <CardContent className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              Não encontrou o que procurava?{" "}
              <Button variant="link" className="p-0 h-auto">
                Abra um chamado
              </Button>
            </p>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum chamado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você ainda não abriu nenhum chamado.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Abrir Primeiro Chamado
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Support;
