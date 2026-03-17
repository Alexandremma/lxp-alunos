// Types
export interface IntegratorProject {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'in_review' | 'submitted';
  deadline: string;
  description: string;
  objective: string;
  skills: string[];
  evaluationCriteria: string[];
  deliverables: string[];
  progress: number;
  thumbnail?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskEvidence {
  id: string;
  type: 'file' | 'link';
  title: string;
  url: string;
  fileType?: string;
  uploadedAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  column: 'planning' | 'research' | 'execution' | 'review' | 'delivery';
  status: 'todo' | 'in_progress' | 'done';
  checklist: ChecklistItem[];
  notes: string;
  createdAt: string;
  evidences: TaskEvidence[];
}

export interface DiaryEntry {
  id: string;
  content: string;
  createdAt: string;
  guidingQuestions?: {
    progress?: string;
    challenges?: string;
    learnings?: string;
  };
}

export interface ProjectEvidence {
  id: string;
  type: 'file' | 'link';
  title: string;
  url: string;
  fileType?: string;
  stage: 'planning' | 'research' | 'execution' | 'review' | 'delivery';
  uploadedAt: string;
}

export interface FinalSubmission {
  synthesis: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt?: string;
}

export interface SelfAssessment {
  organization: number;
  learning: number;
  dedication: number;
  collaboration: number;
  reflection: string;
}

// Mock Data - Multiple Projects
export const mockIntegratorProjects: IntegratorProject[] = [
  {
    id: 'proj-001',
    title: 'Desenvolvimento de Aplicativo de Sustentabilidade Urbana',
    status: 'in_progress',
    deadline: '2024-06-30',
    description: 'Desenvolver uma solução tecnológica que contribua para a sustentabilidade urbana, integrando conhecimentos de programação, design de experiência do usuário e gestão de projetos.',
    objective: 'Criar um aplicativo mobile ou web que ajude cidadãos a adotarem práticas sustentáveis no dia a dia, promovendo engajamento comunitário e impacto ambiental positivo.',
    skills: [
      'Pensamento Crítico',
      'Resolução de Problemas',
      'Trabalho em Equipe',
      'Comunicação',
      'Gestão de Projetos',
      'Design Thinking',
      'Programação',
      'UX/UI Design'
    ],
    evaluationCriteria: [
      'Relevância e impacto social do problema abordado',
      'Qualidade técnica da solução desenvolvida',
      'Inovação e criatividade na abordagem',
      'Viabilidade de implementação',
      'Documentação e apresentação do projeto',
      'Reflexão crítica sobre o processo de aprendizagem'
    ],
    deliverables: [
      'Documento de escopo e planejamento',
      'Protótipo funcional da solução',
      'Relatório técnico do projeto',
      'Apresentação final (pitch)',
      'Diário reflexivo do processo'
    ],
    progress: 45
  },
  {
    id: 'proj-002',
    title: 'Sistema de Gestão Escolar Integrado',
    status: 'submitted',
    deadline: '2024-03-15',
    description: 'Desenvolvimento de uma plataforma web para gestão de atividades escolares, incluindo controle de notas, frequência e comunicação entre pais e professores.',
    objective: 'Criar uma solução digital que facilite a comunicação e o acompanhamento acadêmico entre escola, professores e responsáveis.',
    skills: [
      'Desenvolvimento Web',
      'Banco de Dados',
      'UX/UI Design',
      'Gestão de Projetos',
      'Comunicação'
    ],
    evaluationCriteria: [
      'Usabilidade da interface',
      'Funcionalidades implementadas',
      'Qualidade do código',
      'Documentação técnica'
    ],
    deliverables: [
      'Protótipo funcional',
      'Documentação do sistema',
      'Manual do usuário',
      'Apresentação final'
    ],
    progress: 100
  },
  {
    id: 'proj-003',
    title: 'Plataforma de Mentoria entre Alunos',
    status: 'not_started',
    deadline: '2024-09-30',
    description: 'Criar uma plataforma que conecte alunos veteranos com calouros para mentoria acadêmica e orientação sobre a vida universitária.',
    objective: 'Desenvolver um sistema de matching entre mentores e mentorados, com ferramentas de agendamento e acompanhamento de sessões.',
    skills: [
      'Desenvolvimento Full-Stack',
      'Design de Produto',
      'Pesquisa com Usuários',
      'Metodologias Ágeis'
    ],
    evaluationCriteria: [
      'Eficácia do algoritmo de matching',
      'Experiência do usuário',
      'Escalabilidade da solução',
      'Impacto na comunidade acadêmica'
    ],
    deliverables: [
      'Pesquisa de mercado',
      'MVP funcional',
      'Relatório de testes',
      'Pitch final'
    ],
    progress: 0
  },
  {
    id: 'proj-004',
    title: 'Dashboard de Análise de Dados Climáticos',
    status: 'in_review',
    deadline: '2024-05-20',
    description: 'Desenvolver um dashboard interativo para visualização de dados climáticos históricos e previsões, utilizando APIs públicas e técnicas de visualização de dados.',
    objective: 'Criar uma ferramenta educativa que ajude estudantes e pesquisadores a entender padrões climáticos regionais.',
    skills: [
      'Análise de Dados',
      'Visualização de Dados',
      'APIs REST',
      'React/TypeScript'
    ],
    evaluationCriteria: [
      'Qualidade das visualizações',
      'Performance da aplicação',
      'Precisão dos dados',
      'Design responsivo'
    ],
    deliverables: [
      'Dashboard funcional',
      'Documentação técnica',
      'Guia de uso',
      'Apresentação dos insights'
    ],
    progress: 85
  }
];

// Keep backward compatibility with single project
export const mockIntegratorProject: IntegratorProject = mockIntegratorProjects[0];

export const mockKanbanTasks: KanbanTask[] = [
  {
    id: 'task-001',
    title: 'Definir escopo do projeto',
    column: 'planning',
    status: 'done',
    checklist: [
      { id: 'c1', text: 'Identificar problema a ser resolvido', checked: true },
      { id: 'c2', text: 'Definir público-alvo', checked: true },
      { id: 'c3', text: 'Estabelecer objetivos SMART', checked: true }
    ],
    notes: 'Projeto focará em reciclagem doméstica com gamificação',
    createdAt: '2024-03-01T10:00:00Z',
    evidences: [
      {
        id: 'ev-001',
        type: 'file',
        title: 'Documento de Escopo v1',
        url: '/documents/escopo-projeto.pdf',
        fileType: 'pdf',
        uploadedAt: '2024-03-02T15:00:00Z'
      }
    ]
  },
  {
    id: 'task-002',
    title: 'Criar cronograma de entregas',
    column: 'planning',
    status: 'done',
    checklist: [
      { id: 'c4', text: 'Dividir em sprints de 2 semanas', checked: true },
      { id: 'c5', text: 'Definir marcos principais', checked: true }
    ],
    notes: '',
    createdAt: '2024-03-02T14:00:00Z',
    evidences: []
  },
  {
    id: 'task-003',
    title: 'Pesquisar soluções existentes',
    column: 'research',
    status: 'done',
    checklist: [
      { id: 'c6', text: 'Analisar 5 apps de sustentabilidade', checked: true },
      { id: 'c7', text: 'Identificar pontos fortes e fracos', checked: true },
      { id: 'c8', text: 'Documentar insights', checked: true }
    ],
    notes: 'Principais referências: Cataki, Recicla Aí, JustGreen',
    createdAt: '2024-03-05T09:00:00Z',
    evidences: [
      {
        id: 'ev-002',
        type: 'link',
        title: 'Miro - Brainstorming Inicial',
        url: 'https://miro.com/board/sustentabilidade',
        uploadedAt: '2024-03-05T11:30:00Z'
      },
      {
        id: 'ev-003',
        type: 'file',
        title: 'Análise de Concorrentes',
        url: '/documents/analise-concorrentes.xlsx',
        fileType: 'xlsx',
        uploadedAt: '2024-03-07T14:00:00Z'
      }
    ]
  },
  {
    id: 'task-004',
    title: 'Entrevistar potenciais usuários',
    column: 'research',
    status: 'in_progress',
    checklist: [
      { id: 'c9', text: 'Criar roteiro de entrevista', checked: true },
      { id: 'c10', text: 'Entrevistar 10 pessoas', checked: false },
      { id: 'c11', text: 'Compilar resultados', checked: false }
    ],
    notes: 'Já realizei 6 entrevistas. Principais insights: pessoas querem saber onde descartar cada tipo de material.',
    createdAt: '2024-03-08T11:00:00Z',
    evidences: [
      {
        id: 'ev-005',
        type: 'file',
        title: 'Roteiro de Entrevistas',
        url: '/documents/roteiro-entrevistas.docx',
        fileType: 'docx',
        uploadedAt: '2024-03-08T09:00:00Z'
      }
    ]
  },
  {
    id: 'task-005',
    title: 'Criar wireframes do app',
    column: 'execution',
    status: 'in_progress',
    checklist: [
      { id: 'c12', text: 'Wireframe tela inicial', checked: true },
      { id: 'c13', text: 'Wireframe fluxo de reciclagem', checked: true },
      { id: 'c14', text: 'Wireframe gamificação', checked: false },
      { id: 'c15', text: 'Validar com orientador', checked: false }
    ],
    notes: 'Usando Figma para os wireframes',
    createdAt: '2024-03-12T10:00:00Z',
    evidences: [
      {
        id: 'ev-004',
        type: 'link',
        title: 'Figma - Wireframes',
        url: 'https://figma.com/file/ecoapp-wireframes',
        uploadedAt: '2024-03-13T16:00:00Z'
      }
    ]
  },
  {
    id: 'task-006',
    title: 'Desenvolver MVP',
    column: 'execution',
    status: 'todo',
    checklist: [
      { id: 'c16', text: 'Setup do projeto React Native', checked: false },
      { id: 'c17', text: 'Implementar tela inicial', checked: false },
      { id: 'c18', text: 'Implementar scanner de materiais', checked: false },
      { id: 'c19', text: 'Implementar sistema de pontos', checked: false }
    ],
    notes: '',
    createdAt: '2024-03-15T14:00:00Z',
    evidences: []
  },
  {
    id: 'task-007',
    title: 'Testar com usuários reais',
    column: 'review',
    status: 'todo',
    checklist: [
      { id: 'c20', text: 'Recrutar 5 usuários para teste', checked: false },
      { id: 'c21', text: 'Conduzir sessões de usabilidade', checked: false },
      { id: 'c22', text: 'Documentar feedback', checked: false }
    ],
    notes: '',
    createdAt: '2024-03-18T09:00:00Z',
    evidences: []
  },
  {
    id: 'task-008',
    title: 'Preparar apresentação final',
    column: 'delivery',
    status: 'todo',
    checklist: [
      { id: 'c23', text: 'Criar slides do pitch', checked: false },
      { id: 'c24', text: 'Preparar demo do app', checked: false },
      { id: 'c25', text: 'Ensaiar apresentação', checked: false }
    ],
    notes: '',
    createdAt: '2024-03-20T10:00:00Z',
    evidences: []
  }
];

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: 'diary-001',
    content: 'Hoje foi o primeiro dia oficial do projeto integrador. Estou empolgado com a ideia de criar algo que realmente faça diferença na comunidade. Decidi focar em sustentabilidade porque é um tema que me interessa muito e vejo que há espaço para inovação.',
    createdAt: '2024-03-01T18:30:00Z',
    guidingQuestions: {
      progress: 'Defini o tema geral do projeto e comecei a pesquisar sobre o problema.',
      challenges: 'Ainda estou incerto sobre qual aspecto da sustentabilidade focar.',
      learnings: 'Aprendi que é importante delimitar bem o escopo para não se perder.'
    }
  },
  {
    id: 'diary-002',
    content: 'Depois de uma semana de pesquisa, decidi focar em reciclagem doméstica. Percebi que muitas pessoas querem reciclar mas não sabem como fazer corretamente. A ideia de gamificar o processo surgiu de uma conversa com minha avó, que disse que precisava de motivação extra.',
    createdAt: '2024-03-08T20:15:00Z',
    guidingQuestions: {
      progress: 'Finalizei a pesquisa de mercado e defini o foco do projeto.',
      challenges: 'Encontrar diferenciais em relação aos apps existentes.',
      learnings: 'Insights valiosos vêm de lugares inesperados, como conversas casuais.'
    }
  },
  {
    id: 'diary-003',
    content: 'As entrevistas com usuários estão sendo muito reveladoras. O principal pain point que identifiquei é que as pessoas não sabem onde descartar cada tipo de material. Isso me deu a ideia de incluir um scanner que identifica o material e indica o ponto de coleta mais próximo.',
    createdAt: '2024-03-12T19:45:00Z',
    guidingQuestions: {
      progress: 'Realizei 6 das 10 entrevistas planejadas e comecei os wireframes.',
      challenges: 'Balancear a complexidade técnica do scanner com o prazo disponível.',
      learnings: 'A empatia com o usuário é fundamental para criar soluções relevantes.'
    }
  }
];

export const mockEvidences: ProjectEvidence[] = [
  {
    id: 'ev-001',
    type: 'file',
    title: 'Documento de Escopo v1',
    url: '/documents/escopo-projeto.pdf',
    fileType: 'pdf',
    stage: 'planning',
    uploadedAt: '2024-03-02T15:00:00Z'
  },
  {
    id: 'ev-002',
    type: 'link',
    title: 'Miro - Brainstorming Inicial',
    url: 'https://miro.com/board/sustentabilidade',
    stage: 'research',
    uploadedAt: '2024-03-05T11:30:00Z'
  },
  {
    id: 'ev-003',
    type: 'file',
    title: 'Análise de Concorrentes',
    url: '/documents/analise-concorrentes.xlsx',
    fileType: 'xlsx',
    stage: 'research',
    uploadedAt: '2024-03-07T14:00:00Z'
  },
  {
    id: 'ev-004',
    type: 'link',
    title: 'Figma - Wireframes',
    url: 'https://figma.com/file/ecoapp-wireframes',
    stage: 'execution',
    uploadedAt: '2024-03-13T16:00:00Z'
  },
  {
    id: 'ev-005',
    type: 'file',
    title: 'Roteiro de Entrevistas',
    url: '/documents/roteiro-entrevistas.docx',
    fileType: 'docx',
    stage: 'research',
    uploadedAt: '2024-03-08T09:00:00Z'
  }
];

export const mockFinalSubmission: FinalSubmission = {
  synthesis: '',
  fileUrl: undefined,
  fileName: undefined,
  submittedAt: undefined
};

export const mockSelfAssessment: SelfAssessment = {
  organization: 0,
  learning: 0,
  dedication: 0,
  collaboration: 0,
  reflection: ''
};

export const columnConfig = {
  planning: { label: 'Planejamento', color: 'bg-blue-500', icon: 'ClipboardList' },
  research: { label: 'Pesquisa & Ideação', color: 'bg-purple-500', icon: 'Lightbulb' },
  execution: { label: 'Execução', color: 'bg-orange-500', icon: 'Hammer' },
  review: { label: 'Revisão', color: 'bg-yellow-500', icon: 'Search' },
  delivery: { label: 'Entrega Final', color: 'bg-green-500', icon: 'CheckCircle' }
} as const;

// Status configuration for project cards
export const statusConfig = {
  not_started: { 
    label: 'Não iniciado', 
    color: 'bg-muted text-muted-foreground',
    borderColor: 'border-border',
    cta: 'Iniciar'
  },
  in_progress: { 
    label: 'Em andamento', 
    color: 'bg-blue-500/20 text-blue-400',
    borderColor: 'border-blue-500/30',
    cta: 'Continuar'
  },
  in_review: { 
    label: 'Em revisão', 
    color: 'bg-yellow-500/20 text-yellow-400',
    borderColor: 'border-yellow-500/30',
    cta: 'Aguardando'
  },
  submitted: { 
    label: 'Entregue', 
    color: 'bg-green-500/20 text-green-400',
    borderColor: 'border-green-500/30',
    cta: 'Visualizar'
  }
} as const;
