import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, SearchInput, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from "@/components/ui/skeleton";
import { EmptyState, EmptyStateNoResults } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Settings,
  User,
  Mail,
  Lock,
  Eye,
  Download,
  Trash2,
  Edit,
  MoreHorizontal,
  ChevronDown,
  Copy,
  Home,
  FileText,
  Users,
  BarChart3,
  Loader2,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  Star,
  Heart,
  Zap,
  Globe,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Color palette data
const colorPalettes = {
  primary: {
    name: "Primary",
    description: "Main brand color - use for CTAs and key actions",
    shades: [
      { name: "50", class: "bg-primary-50", textClass: "text-foreground" },
      { name: "100", class: "bg-primary-100", textClass: "text-foreground" },
      { name: "200", class: "bg-primary-200", textClass: "text-foreground" },
      { name: "300", class: "bg-primary-300", textClass: "text-foreground" },
      { name: "400", class: "bg-primary-400", textClass: "text-foreground" },
      { name: "500", class: "bg-primary-500", textClass: "text-white" },
      { name: "600", class: "bg-primary-600", textClass: "text-white" },
      { name: "700", class: "bg-primary-700", textClass: "text-white" },
      { name: "800", class: "bg-primary-800", textClass: "text-white" },
      { name: "900", class: "bg-primary-900", textClass: "text-white" },
    ],
  },
  secondary: {
    name: "Secondary",
    description: "Secondary actions and accents",
    shades: [
      { name: "50", class: "bg-secondary-50", textClass: "text-foreground" },
      { name: "100", class: "bg-secondary-100", textClass: "text-foreground" },
      { name: "200", class: "bg-secondary-200", textClass: "text-foreground" },
      { name: "300", class: "bg-secondary-300", textClass: "text-foreground" },
      { name: "400", class: "bg-secondary-400", textClass: "text-foreground" },
      { name: "500", class: "bg-secondary-500", textClass: "text-white" },
    ],
  },
  neutral: {
    name: "Neutral",
    description: "Backgrounds, borders and text",
    shades: [
      { name: "50", class: "bg-neutral-50", textClass: "text-foreground" },
      { name: "100", class: "bg-neutral-100", textClass: "text-foreground" },
      { name: "200", class: "bg-neutral-200", textClass: "text-foreground" },
      { name: "300", class: "bg-neutral-300", textClass: "text-foreground" },
      { name: "400", class: "bg-neutral-400", textClass: "text-foreground" },
      { name: "500", class: "bg-neutral-500", textClass: "text-white" },
      { name: "600", class: "bg-neutral-600", textClass: "text-white" },
      { name: "700", class: "bg-neutral-700", textClass: "text-white" },
      { name: "800", class: "bg-neutral-800", textClass: "text-white" },
      { name: "900", class: "bg-neutral-900", textClass: "text-white" },
    ],
  },
};

const semanticColors = [
  {
    name: "Success",
    class: "bg-success",
    mutedClass: "bg-success-muted",
    description: "Positive actions and confirmations",
  },
  {
    name: "Warning",
    class: "bg-warning",
    mutedClass: "bg-warning-muted",
    description: "Caution and attention required",
  },
  {
    name: "Destructive",
    class: "bg-destructive",
    mutedClass: "bg-destructive-muted",
    description: "Errors and destructive actions",
  },
  {
    name: "Info",
    class: "bg-info",
    mutedClass: "bg-info-muted",
    description: "Informational messages",
  },
];

// Sample table data
interface TableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const tableData: TableUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "active" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "inactive" },
];

const tableColumns: Column<TableUser>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", sortable: true },
  { key: "role", header: "Role" },
  {
    key: "status",
    header: "Status",
    cell: (user) => (
      <Badge variant={user.status === "active" ? "success-muted" : "destructive-muted"}>
        {user.status}
      </Badge>
    ),
  },
];

// Spacing scale
const spacingScale = [
  { name: "0.5", value: "2px", class: "w-0.5" },
  { name: "1", value: "4px", class: "w-1" },
  { name: "2", value: "8px", class: "w-2" },
  { name: "3", value: "12px", class: "w-3" },
  { name: "4", value: "16px", class: "w-4" },
  { name: "5", value: "20px", class: "w-5" },
  { name: "6", value: "24px", class: "w-6" },
  { name: "8", value: "32px", class: "w-8" },
  { name: "10", value: "40px", class: "w-10" },
  { name: "12", value: "48px", class: "w-12" },
  { name: "16", value: "64px", class: "w-16" },
];

// Section Component
const Section = ({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-20">
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    {children}
    <Separator className="mt-12" />
  </section>
);

// Subsection Component
const Subsection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

// Code Block Component
const CodeBlock = ({ children }: { children: string }) => (
  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
    {children}
  </code>
);

const KitchenSink = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(45);

  const handleShowToast = (
    variant: "default" | "destructive" = "default",
    title: string,
    description: string
  ) => {
    toast({ title, description, variant });
  };

  // Table of contents
  const tocItems = [
    { id: "colors", label: "Cores" },
    { id: "typography", label: "Tipografia" },
    { id: "spacing", label: "Espaçamento" },
    { id: "buttons", label: "Botões" },
    { id: "inputs", label: "Inputs & Forms" },
    { id: "components", label: "Componentes UI" },
    { id: "feedback", label: "Feedback & Estados" },
    { id: "cards", label: "Cards & Containers" },
    { id: "tables", label: "Tabelas & Listas" },
    { id: "accessibility", label: "Acessibilidade" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Kitchen Sink"
        description="Documentação visual completa do Design System"
        backButton
      />

      <div className="flex gap-8">
        {/* Table of Contents - Sticky Sidebar */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-6">
            <h4 className="font-semibold mb-4 text-sm">Navegação</h4>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-md hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-12 min-w-0">
          {/* ==================== COLORS ==================== */}
          <Section
            id="colors"
            title="1. Identidade Visual - Cores"
            description="Paleta de cores completa do sistema com variações e casos de uso recomendados."
          >
            {/* Primary Colors */}
            <Subsection title="Primary - Cor Principal">
              <p className="text-sm text-muted-foreground mb-4">
                {colorPalettes.primary.description}
              </p>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {colorPalettes.primary.shades.map((shade) => (
                  <div key={shade.name} className="space-y-1.5">
                    <div
                      className={cn(
                        "aspect-square rounded-lg flex items-end justify-center pb-2",
                        shade.class
                      )}
                    >
                      <span className={cn("text-xs font-medium", shade.textClass)}>
                        {shade.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>

            {/* Secondary Colors */}
            <Subsection title="Secondary - Cor Secundária">
              <p className="text-sm text-muted-foreground mb-4">
                {colorPalettes.secondary.description}
              </p>
              <div className="grid grid-cols-6 gap-2 max-w-md">
                {colorPalettes.secondary.shades.map((shade) => (
                  <div key={shade.name} className="space-y-1.5">
                    <div
                      className={cn(
                        "aspect-square rounded-lg flex items-end justify-center pb-2",
                        shade.class
                      )}
                    >
                      <span className={cn("text-xs font-medium", shade.textClass)}>
                        {shade.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>

            {/* Neutral Colors */}
            <Subsection title="Neutral - Tons Neutros">
              <p className="text-sm text-muted-foreground mb-4">
                {colorPalettes.neutral.description}
              </p>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {colorPalettes.neutral.shades.map((shade) => (
                  <div key={shade.name} className="space-y-1.5">
                    <div
                      className={cn(
                        "aspect-square rounded-lg flex items-end justify-center pb-2 border border-border/50",
                        shade.class
                      )}
                    >
                      <span className={cn("text-xs font-medium", shade.textClass)}>
                        {shade.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>

            {/* Semantic Colors */}
            <Subsection title="Semantic - Cores de Estado">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semanticColors.map((color) => (
                  <Card key={color.name} variant="outline">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className={cn("h-12 flex-1 rounded-md", color.class)} />
                          <div className={cn("h-12 flex-1 rounded-md", color.mutedClass)} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{color.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {color.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Subsection>

            {/* Surface Colors */}
            <Subsection title="Surface - Superfícies">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm font-medium">Background</p>
                  <code className="text-xs text-muted-foreground">bg-background</code>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm font-medium">Card</p>
                  <code className="text-xs text-muted-foreground">bg-card</code>
                </div>
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="text-sm font-medium">Muted</p>
                  <code className="text-xs text-muted-foreground">bg-muted</code>
                </div>
                <div className="p-4 rounded-lg bg-accent border">
                  <p className="text-sm font-medium">Accent</p>
                  <code className="text-xs text-muted-foreground">bg-accent</code>
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ==================== TYPOGRAPHY ==================== */}
          <Section
            id="typography"
            title="2. Tipografia"
            description="Sistema tipográfico com hierarquia clara, tamanhos e pesos definidos."
          >
            {/* Font Families */}
            <Subsection title="Fontes">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Space Grotesk</CardTitle>
                    <CardDescription>Display / Títulos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-4xl">Aa Bb Cc 123</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Usada em títulos, headings e elementos de destaque
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Inter</CardTitle>
                    <CardDescription>Body / Interface</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl">Aa Bb Cc 123</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Usada em textos de corpo, labels e interface
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Subsection>

            {/* Headings */}
            <Subsection title="Headings">
              <div className="space-y-6">
                <div className="flex items-baseline gap-4 pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground w-16">H1</span>
                  <h1 className="flex-1">The quick brown fox jumps</h1>
                  <code className="text-xs text-muted-foreground">text-4xl/5xl</code>
                </div>
                <div className="flex items-baseline gap-4 pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground w-16">H2</span>
                  <h2 className="flex-1">The quick brown fox jumps</h2>
                  <code className="text-xs text-muted-foreground">text-3xl/4xl</code>
                </div>
                <div className="flex items-baseline gap-4 pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground w-16">H3</span>
                  <h3 className="flex-1">The quick brown fox jumps</h3>
                  <code className="text-xs text-muted-foreground">text-2xl/3xl</code>
                </div>
                <div className="flex items-baseline gap-4 pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground w-16">H4</span>
                  <h4 className="flex-1">The quick brown fox jumps</h4>
                  <code className="text-xs text-muted-foreground">text-xl/2xl</code>
                </div>
                <div className="flex items-baseline gap-4 pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground w-16">H5</span>
                  <h5 className="flex-1">The quick brown fox jumps</h5>
                  <code className="text-xs text-muted-foreground">text-lg/xl</code>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-sm text-muted-foreground w-16">H6</span>
                  <h6 className="flex-1">The quick brown fox jumps</h6>
                  <code className="text-xs text-muted-foreground">text-base/lg</code>
                </div>
              </div>
            </Subsection>

            {/* Body Text */}
            <Subsection title="Body Text">
              <div className="space-y-6">
                <div>
                  <p className="text-label mb-2">Body Large</p>
                  <p className="text-body-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <code className="text-xs text-muted-foreground">text-body-lg</code>
                </div>
                <div>
                  <p className="text-label mb-2">Body Regular</p>
                  <p className="text-body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <code className="text-xs text-muted-foreground">text-body</code>
                </div>
                <div>
                  <p className="text-label mb-2">Body Small</p>
                  <p className="text-body-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <code className="text-xs text-muted-foreground">text-body-sm</code>
                </div>
              </div>
            </Subsection>

            {/* Special Text Styles */}
            <Subsection title="Estilos Especiais">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-display mb-2">Display</p>
                    <code className="text-xs text-muted-foreground">text-display</code>
                  </div>
                  <div>
                    <p className="text-headline mb-2">Headline</p>
                    <code className="text-xs text-muted-foreground">text-headline</code>
                  </div>
                  <div>
                    <p className="text-title mb-2">Title</p>
                    <code className="text-xs text-muted-foreground">text-title</code>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-label mb-2">Label</p>
                    <code className="text-xs text-muted-foreground">text-label</code>
                  </div>
                  <div>
                    <p className="text-caption mb-2">Caption text</p>
                    <code className="text-xs text-muted-foreground">text-caption</code>
                  </div>
                  <div>
                    <p className="text-overline mb-2">Overline</p>
                    <code className="text-xs text-muted-foreground">text-overline</code>
                  </div>
                  <div>
                    <p className="text-gradient text-2xl font-bold mb-2">
                      Gradient Text
                    </p>
                    <code className="text-xs text-muted-foreground">text-gradient</code>
                  </div>
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ==================== SPACING ==================== */}
          <Section
            id="spacing"
            title="3. Espaçamento & Grid"
            description="Escala de espaçamento baseada em 4px para consistência visual."
          >
            {/* Spacing Scale */}
            <Subsection title="Escala de Espaçamento">
              <div className="space-y-3">
                {spacingScale.map((space) => (
                  <div key={space.name} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-12">
                      {space.name}
                    </span>
                    <span className="text-sm w-16">{space.value}</span>
                    <div className="flex-1 flex items-center">
                      <div
                        className={cn("h-4 bg-primary rounded", space.class)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>

            {/* Padding Examples */}
            <Subsection title="Exemplos de Padding">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["p-2", "p-4", "p-6", "p-8"].map((padding) => (
                  <div key={padding} className="border border-dashed border-border rounded-lg">
                    <div className={cn("bg-primary/20 rounded", padding)}>
                      <div className="bg-card border rounded p-2 text-center">
                        <code className="text-xs">{padding}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>

            {/* Gap Examples */}
            <Subsection title="Exemplos de Gap">
              <div className="space-y-4">
                {["gap-2", "gap-4", "gap-6", "gap-8"].map((gap) => (
                  <div key={gap}>
                    <code className="text-xs text-muted-foreground mb-2 block">
                      {gap}
                    </code>
                    <div className={cn("flex", gap)}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-10 w-10 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ==================== BUTTONS ==================== */}
          <Section
            id="buttons"
            title="4. Botões"
            description="Todos os estilos de botões com variantes e estados."
          >
            {/* Button Variants */}
            <Subsection title="Variantes">
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="glow">Glow</Button>
                <Button variant="gradient">Gradient</Button>
              </div>
            </Subsection>

            {/* Button Sizes */}
            <Subsection title="Tamanhos">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </Subsection>

            {/* Button States */}
            <Subsection title="Estados">
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </Subsection>

            {/* Button with Icons */}
            <Subsection title="Com Ícones">
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Plus className="h-4 w-4" />
                  Com ícone à esquerda
                </Button>
                <Button>
                  Com ícone à direita
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon-sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </Subsection>

            {/* Interactive Demo */}
            <Subsection title="Demo Interativo">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      loading={isLoading}
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 2000);
                      }}
                    >
                      {isLoading ? "Processando..." : "Clique para Loading"}
                    </Button>
                    <Button
                      variant="success"
                      onClick={() =>
                        handleShowToast("default", "Sucesso!", "Ação realizada com sucesso.")
                      }
                    >
                      Mostrar Toast Sucesso
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleShowToast("destructive", "Erro!", "Algo deu errado.")
                      }
                    >
                      Mostrar Toast Erro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Subsection>
          </Section>

          {/* ==================== INPUTS ==================== */}
          <Section
            id="inputs"
            title="5. Inputs & Formulários"
            description="Campos de entrada e controles de formulário."
          >
            {/* Text Inputs */}
            <Subsection title="Text Inputs">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default">Input Padrão</Label>
                  <Input id="default" placeholder="Digite algo..." />
                  <p className="text-xs text-muted-foreground">
                    Helper text para o campo
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled">Input Desabilitado</Label>
                  <Input id="disabled" placeholder="Desabilitado" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="error">Input com Erro</Label>
                  <Input id="error" placeholder="Campo inválido" error />
                  <p className="text-xs text-destructive">
                    Este campo é obrigatório
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">Search Input</Label>
                  <SearchInput id="search" placeholder="Buscar..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Input</Label>
                  <PasswordInput id="password" placeholder="Senha..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textarea">Textarea</Label>
                  <Textarea
                    id="textarea"
                    placeholder="Digite um texto longo..."
                    rows={3}
                  />
                </div>
              </div>
            </Subsection>

            {/* Select */}
            <Subsection title="Select">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Padrão</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Opção 1</SelectItem>
                      <SelectItem value="2">Opção 2</SelectItem>
                      <SelectItem value="3">Opção 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Desabilitado</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Desabilitado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Opção 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Subsection>

            {/* Checkboxes & Radios */}
            <Subsection title="Checkbox, Radio & Switch">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Checkboxes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="check1" />
                      <Label htmlFor="check1">Opção 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="check2" defaultChecked />
                      <Label htmlFor="check2">Opção 2 (marcada)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="check3" disabled />
                      <Label htmlFor="check3">Opção 3 (desabilitada)</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Radio Group</h4>
                  <RadioGroup defaultValue="option1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <Label htmlFor="r1">Opção 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <Label htmlFor="r2">Opção 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option3" id="r3" disabled />
                      <Label htmlFor="r3">Opção 3 (desabilitada)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Switches</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="switch1" />
                      <Label htmlFor="switch1">Notificações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="switch2" defaultChecked />
                      <Label htmlFor="switch2">Dark Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="switch3" disabled />
                      <Label htmlFor="switch3">Desabilitado</Label>
                    </div>
                  </div>
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ==================== UI COMPONENTS ==================== */}
          <Section
            id="components"
            title="6. Componentes de Interface"
            description="Badges, avatars, tooltips, dropdowns e mais."
          >
            {/* Badges */}
            <Subsection title="Badges">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success-muted">Success Muted</Badge>
                  <Badge variant="warning-muted">Warning Muted</Badge>
                  <Badge variant="destructive-muted">Destructive Muted</Badge>
                  <Badge variant="info-muted">Info Muted</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="default">Default</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </Subsection>

            {/* Avatars */}
            <Subsection title="Avatars">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>XL</AvatarFallback>
                </Avatar>
                <div className="flex -space-x-3">
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">B</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-destructive text-destructive-foreground">C</AvatarFallback>
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-muted text-muted-foreground">+3</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </Subsection>

            {/* Tooltips */}
            <Subsection title="Tooltips">
              <div className="flex flex-wrap gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltip padrão</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Tooltip à direita</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Configurações</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </Subsection>

            {/* Dropdowns */}
            <Subsection title="Dropdowns">
              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Menu Simples
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Com Seções
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Subsection>

            {/* Tabs */}
            <Subsection title="Tabs">
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Geral</TabsTrigger>
                  <TabsTrigger value="tab2">Configurações</TabsTrigger>
                  <TabsTrigger value="tab3">Avançado</TabsTrigger>
                  <TabsTrigger value="tab4" disabled>
                    Desabilitado
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      Conteúdo da aba Geral
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      Conteúdo da aba Configurações
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      Conteúdo da aba Avançado
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Subsection>

            {/* Breadcrumbs */}
            <Subsection title="Breadcrumbs">
              <div className="space-y-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Kitchen Sink</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </Subsection>

            {/* Pagination */}
            <Subsection title="Pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </Subsection>

            {/* Progress */}
            <Subsection title="Progress">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    -10%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ==================== FEEDBACK ==================== */}
          <Section
            id="feedback"
            title="7. Feedback & Estados"
            description="Alerts, toasts, empty states e loading indicators."
          >
            {/* Alerts */}
            <Subsection title="Alerts">
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Default Alert</AlertTitle>
                  <AlertDescription>
                    Esta é uma mensagem de alerta padrão.
                  </AlertDescription>
                </Alert>
                <Alert variant="success" onClose={() => {}}>
                  <AlertTitle>Sucesso!</AlertTitle>
                  <AlertDescription>
                    Operação realizada com sucesso.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning" onClose={() => {}}>
                  <AlertTitle>Atenção!</AlertTitle>
                  <AlertDescription>
                    Revise as alterações antes de continuar.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive" onClose={() => {}}>
                  <AlertTitle>Erro!</AlertTitle>
                  <AlertDescription>
                    Algo deu errado. Por favor, tente novamente.
                  </AlertDescription>
                </Alert>
                <Alert variant="info" onClose={() => {}}>
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Aqui está uma informação útil para você.
                  </AlertDescription>
                </Alert>
              </div>
            </Subsection>

            {/* Empty States */}
            <Subsection title="Empty States">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <EmptyState
                      title="Nenhum item encontrado"
                      description="Comece criando seu primeiro item."
                      action={{
                        label: "Criar Item",
                        onClick: () => {},
                      }}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <EmptyStateNoResults
                      action={{
                        label: "Limpar filtros",
                        onClick: () => {},
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </Subsection>

            {/* Skeleton Loaders */}
            <Subsection title="Skeleton Loaders">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Skeleton Lines</h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Skeleton Card</h4>
                  <SkeletonCard />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium">Skeleton List</h4>
                <SkeletonList items={2} />
              </div>
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium">Skeleton Table</h4>
                <SkeletonTable rows={3} columns={4} />
              </div>
            </Subsection>

            {/* Loading Spinners */}
            <Subsection title="Loading Spinners">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Default</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-xs text-muted-foreground">Circle</span>
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ==================== CARDS ==================== */}
          <Section
            id="cards"
            title="8. Cards & Containers"
            description="Variações de cards e containers."
          >
            {/* Card Variants */}
            <Subsection title="Variantes de Card">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default</CardTitle>
                    <CardDescription>Card padrão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Conteúdo do card com sombra leve.
                  </CardContent>
                </Card>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevated</CardTitle>
                    <CardDescription>Card elevado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Conteúdo do card com sombra forte.
                  </CardContent>
                </Card>
                <Card variant="interactive">
                  <CardHeader>
                    <CardTitle>Interactive</CardTitle>
                    <CardDescription>Hover para ver</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Card clicável com hover effect.
                  </CardContent>
                </Card>
                <Card variant="glow">
                  <CardHeader>
                    <CardTitle>Glow</CardTitle>
                    <CardDescription>Com efeito glow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Card com efeito de brilho no hover.
                  </CardContent>
                </Card>
              </div>
            </Subsection>

            {/* Card with Header Actions */}
            <Subsection title="Card com Ações">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Card com Header</CardTitle>
                      <CardDescription>
                        Card com título e ações no header
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                        Novo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  Conteúdo do card com botões de ação no header.
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar</Button>
                </CardFooter>
              </Card>
            </Subsection>

            {/* Stat Cards */}
            <Subsection title="Stat Cards">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value="12,345"
                  icon={Users}
                  trend={{ value: 12, label: "vs last month" }}
                  variant="primary"
                />
                <StatCard
                  title="Revenue"
                  value="$54,321"
                  icon={BarChart3}
                  trend={{ value: -5, label: "vs last month" }}
                  variant="secondary"
                />
                <StatCard
                  title="Active Sessions"
                  value="1,234"
                  icon={Globe}
                  variant="success"
                  progress={{ current: 1234, max: 2000 }}
                />
                <StatCard
                  title="Pending Tasks"
                  value="42"
                  icon={Clock}
                  variant="warning"
                />
              </div>
            </Subsection>
          </Section>

          {/* ==================== TABLES ==================== */}
          <Section
            id="tables"
            title="9. Tabelas & Listas"
            description="Tabelas de dados com ordenação, seleção e ações."
          >
            {/* Data Table */}
            <Subsection title="Data Table Completa">
              <DataTable
                columns={tableColumns}
                data={tableData}
                selectable
                pagination={{
                  page: 1,
                  pageSize: 10,
                  total: 25,
                  onPageChange: () => {},
                }}
              />
            </Subsection>

            {/* Simple List */}
            <Subsection title="Lista Simples">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>U{item}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">User {item}</p>
                            <p className="text-sm text-muted-foreground">
                              user{item}@example.com
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success-muted">Active</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Subsection>
          </Section>

          {/* ==================== ACCESSIBILITY ==================== */}
          <Section
            id="accessibility"
            title="10. Acessibilidade & Boas Práticas"
            description="Exemplos de contraste, foco e tamanhos mínimos."
          >
            {/* Focus States */}
            <Subsection title="Estados de Foco">
              <p className="text-sm text-muted-foreground mb-4">
                Todos os elementos interativos possuem estados de foco visíveis.
                Use Tab para navegar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button>Foco no Botão</Button>
                <Input placeholder="Foco no Input" className="w-48" />
                <Checkbox id="focus-check" />
                <Switch id="focus-switch" />
              </div>
            </Subsection>

            {/* Minimum Tap Targets */}
            <Subsection title="Tamanhos Mínimos Clicáveis">
              <p className="text-sm text-muted-foreground mb-4">
                Todos os elementos interativos têm tamanho mínimo de 44x44px
                para toque.
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="absolute -inset-1 border border-dashed border-primary rounded-lg pointer-events-none" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Área mínima de toque: 40x40px
                </span>
              </div>
            </Subsection>

            {/* Contrast Examples */}
            <Subsection title="Contraste de Cores">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-success flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Bom Contraste
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-3 rounded bg-primary text-primary-foreground">
                      Texto branco em fundo primário
                    </div>
                    <div className="p-3 rounded bg-card text-foreground border">
                      Texto em fundo de card
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Evitar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-3 rounded bg-muted text-muted-foreground/50 text-sm">
                      Texto com baixo contraste (exemplo do que evitar)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Subsection>

            {/* Visual Feedback */}
            <Subsection title="Feedback Visual">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleShowToast("default", "Ação Realizada", "Feedback imediato para o usuário.")
                      }
                    >
                      Ação com Feedback
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique para ver o toast
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4" />
                      Ação Destrutiva
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cor indica risco
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Button variant="success" className="w-full">
                      <Check className="h-4 w-4" />
                      Confirmar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cor indica sucesso
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Subsection>
          </Section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenSink;
