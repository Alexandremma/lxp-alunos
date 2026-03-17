// ============================================
// MOCK DATA - Portal do Aluno Universitário
// ============================================

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  semester: number;
  xp: number;
  level: number;
  streak: number;
  enrolledAt: string;
  registration: string;
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  instructor: string;
  status: 'not_started' | 'in_progress' | 'completed';
  deadline?: string;
  xpReward: number;
}

export interface Module {
  id: string;
  trailId: string;
  title: string;
  description: string;
  order: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'quiz' | 'project' | 'discussion';
  duration: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  order: number;
  xpReward: number;
  content?: string;
  videoUrl?: string;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project';
  grade?: number;
  maxGrade: number;
  feedback?: string;
  submittedAt?: string;
  dueDate: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  type: 'certificate' | 'project' | 'badge' | 'participation';
  imageUrl: string;
  earnedAt: string;
  trailId?: string;
  shareUrl?: string;
  // Gamification fields
  xpReward?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  unlockedBy?: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'project' | 'deadline';
  trailTitle: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
}

// ============================================
// COURSE STRUCTURE - GRADE CURRICULAR
// ============================================

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  workload: number;
  status: 'approved' | 'in_progress' | 'pending' | 'failed';
  grade?: number;
  professor?: string;
}

export interface Period {
  id: string;
  number: number;
  name: string;
  status: 'completed' | 'current' | 'future';
  subjects: Subject[];
}

export interface Course {
  id: string;
  name: string;
  type: 'graduation' | 'postgrad';
  totalPeriods: number;
  currentPeriod: number;
  periods: Period[];
}

// ============================================
// FREE COURSES - EXTENSÃO
// ============================================

export interface FreeCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'language' | 'workshop' | 'certification' | 'extension' | 'course';
  status: 'available' | 'enrolled' | 'completed';
  workload: number;
  instructor: string;
  startDate?: string;
  progress?: number;
}

// ============================================
// SECRETARIA - DOCUMENTOS
// ============================================

export interface Document {
  id: string;
  type: 'declaration' | 'transcript' | 'certificate' | 'enrollment';
  name: string;
  description: string;
  status: 'available' | 'requested' | 'ready' | 'delivered';
  requestedAt?: string;
  readyAt?: string;
  price?: number;
}

// ============================================
// SECRETARIA - FINANCEIRO
// ============================================

export interface FinancialItem {
  id: string;
  description: string;
  reference: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidAt?: string;
  barcode?: string;
}

// ============================================
// SECRETARIA - MATRÍCULA
// ============================================

export interface EnrollmentStatus {
  status: 'active' | 'locked' | 'graduated' | 'suspended';
  semester: string;
  enrollmentDate: string;
  renewalStart?: string;
  renewalEnd?: string;
  canRenew: boolean;
}

// ============================================
// SECRETARIA - ATENDIMENTO
// ============================================

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'academic' | 'financial' | 'technical' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  sender: 'student' | 'support';
  content: string;
  sentAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// ============================================
// STUDENT DATA
// ============================================

export const currentStudent: Student = {
  id: 'student-001',
  name: 'Ana Carolina Silva',
  email: 'ana.silva@universidade.edu.br',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  course: 'Ciência da Computação',
  semester: 5,
  xp: 2450,
  level: 12,
  streak: 7,
  enrolledAt: '2022-02-15',
  registration: '2022.1.0001',
};

// ============================================
// COURSE DATA - GRADE CURRICULAR
// ============================================

export const mainCourse: Course = {
  id: 'course-001',
  name: 'Ciência da Computação',
  type: 'graduation',
  totalPeriods: 8,
  currentPeriod: 5,
  periods: [
    {
      id: 'period-1',
      number: 1,
      name: '1º Período',
      status: 'completed',
      subjects: [
        { id: 's1-1', name: 'Cálculo I', code: 'MAT101', credits: 6, workload: 90, status: 'approved', grade: 8.5, professor: 'Dr. Paulo Santos' },
        { id: 's1-2', name: 'Introdução à Computação', code: 'CMP101', credits: 4, workload: 60, status: 'approved', grade: 9.0, professor: 'Profa. Ana Lima' },
        { id: 's1-3', name: 'Lógica Matemática', code: 'MAT102', credits: 4, workload: 60, status: 'approved', grade: 7.5, professor: 'Dr. Carlos Mendes' },
        { id: 's1-4', name: 'Algoritmos e Programação', code: 'CMP102', credits: 6, workload: 90, status: 'approved', grade: 9.5, professor: 'Prof. Ricardo Oliveira' },
        { id: 's1-5', name: 'Inglês Técnico I', code: 'LET101', credits: 2, workload: 30, status: 'approved', grade: 8.0, professor: 'Profa. Maria Costa' },
      ],
    },
    {
      id: 'period-2',
      number: 2,
      name: '2º Período',
      status: 'completed',
      subjects: [
        { id: 's2-1', name: 'Cálculo II', code: 'MAT201', credits: 6, workload: 90, status: 'approved', grade: 7.0, professor: 'Dr. Paulo Santos' },
        { id: 's2-2', name: 'Estruturas de Dados', code: 'CMP201', credits: 6, workload: 90, status: 'approved', grade: 8.5, professor: 'Prof. Ricardo Oliveira' },
        { id: 's2-3', name: 'Álgebra Linear', code: 'MAT202', credits: 4, workload: 60, status: 'approved', grade: 8.0, professor: 'Dra. Fernanda Reis' },
        { id: 's2-4', name: 'Arquitetura de Computadores', code: 'CMP202', credits: 4, workload: 60, status: 'approved', grade: 9.0, professor: 'Prof. João Silva' },
        { id: 's2-5', name: 'Inglês Técnico II', code: 'LET201', credits: 2, workload: 30, status: 'approved', grade: 8.5, professor: 'Profa. Maria Costa' },
      ],
    },
    {
      id: 'period-3',
      number: 3,
      name: '3º Período',
      status: 'completed',
      subjects: [
        { id: 's3-1', name: 'Cálculo III', code: 'MAT301', credits: 4, workload: 60, status: 'approved', grade: 7.5, professor: 'Dra. Patrícia Lima' },
        { id: 's3-2', name: 'Programação Orientada a Objetos', code: 'CMP301', credits: 6, workload: 90, status: 'approved', grade: 9.0, professor: 'Prof. Ricardo Oliveira' },
        { id: 's3-3', name: 'Banco de Dados I', code: 'CMP302', credits: 4, workload: 60, status: 'approved', grade: 8.5, professor: 'Profa. Ana Lima' },
        { id: 's3-4', name: 'Sistemas Operacionais', code: 'CMP303', credits: 4, workload: 60, status: 'approved', grade: 8.0, professor: 'Prof. João Silva' },
        { id: 's3-5', name: 'Probabilidade e Estatística', code: 'MAT302', credits: 4, workload: 60, status: 'approved', grade: 7.0, professor: 'Dr. Carlos Mendes' },
      ],
    },
    {
      id: 'period-4',
      number: 4,
      name: '4º Período',
      status: 'completed',
      subjects: [
        { id: 's4-1', name: 'Engenharia de Software', code: 'CMP401', credits: 4, workload: 60, status: 'approved', grade: 9.0, professor: 'Profa. Beatriz Santos' },
        { id: 's4-2', name: 'Redes de Computadores', code: 'CMP402', credits: 4, workload: 60, status: 'approved', grade: 8.5, professor: 'Prof. Marcos Pereira' },
        { id: 's4-3', name: 'Banco de Dados II', code: 'CMP403', credits: 4, workload: 60, status: 'approved', grade: 8.0, professor: 'Profa. Ana Lima' },
        { id: 's4-4', name: 'Teoria da Computação', code: 'CMP404', credits: 4, workload: 60, status: 'approved', grade: 7.5, professor: 'Dr. Felipe Rodrigues' },
        { id: 's4-5', name: 'Interface Humano-Computador', code: 'CMP405', credits: 4, workload: 60, status: 'approved', grade: 9.5, professor: 'Profa. Marina Costa' },
      ],
    },
    {
      id: 'period-5',
      number: 5,
      name: '5º Período',
      status: 'current',
      subjects: [
        { id: 's5-1', name: 'Inteligência Artificial', code: 'CMP501', credits: 4, workload: 60, status: 'in_progress', professor: 'Dr. Ricardo Mendes' },
        { id: 's5-2', name: 'Compiladores', code: 'CMP502', credits: 4, workload: 60, status: 'in_progress', professor: 'Dr. Felipe Rodrigues' },
        { id: 's5-3', name: 'Desenvolvimento Web', code: 'CMP503', credits: 4, workload: 60, status: 'in_progress', professor: 'Prof. Lucas Oliveira' },
        { id: 's5-4', name: 'Segurança da Informação', code: 'CMP504', credits: 4, workload: 60, status: 'in_progress', professor: 'Prof. Marcos Pereira' },
        { id: 's5-5', name: 'Projeto Integrador I', code: 'CMP505', credits: 4, workload: 60, status: 'in_progress', professor: 'Profa. Beatriz Santos' },
      ],
    },
    {
      id: 'period-6',
      number: 6,
      name: '6º Período',
      status: 'future',
      subjects: [
        { id: 's6-1', name: 'Machine Learning', code: 'CMP601', credits: 4, workload: 60, status: 'pending', professor: 'Dr. Ricardo Mendes' },
        { id: 's6-2', name: 'Computação em Nuvem', code: 'CMP602', credits: 4, workload: 60, status: 'pending', professor: 'Prof. Marcos Pereira' },
        { id: 's6-3', name: 'Desenvolvimento Mobile', code: 'CMP603', credits: 4, workload: 60, status: 'pending', professor: 'Prof. Lucas Oliveira' },
        { id: 's6-4', name: 'Gestão de Projetos', code: 'CMP604', credits: 4, workload: 60, status: 'pending', professor: 'Profa. Beatriz Santos' },
        { id: 's6-5', name: 'Optativa I', code: 'OPT601', credits: 4, workload: 60, status: 'pending' },
      ],
    },
    {
      id: 'period-7',
      number: 7,
      name: '7º Período',
      status: 'future',
      subjects: [
        { id: 's7-1', name: 'Deep Learning', code: 'CMP701', credits: 4, workload: 60, status: 'pending' },
        { id: 's7-2', name: 'Big Data', code: 'CMP702', credits: 4, workload: 60, status: 'pending' },
        { id: 's7-3', name: 'Projeto Integrador II', code: 'CMP703', credits: 4, workload: 60, status: 'pending' },
        { id: 's7-4', name: 'Empreendedorismo', code: 'ADM701', credits: 2, workload: 30, status: 'pending' },
        { id: 's7-5', name: 'Optativa II', code: 'OPT701', credits: 4, workload: 60, status: 'pending' },
      ],
    },
    {
      id: 'period-8',
      number: 8,
      name: '8º Período',
      status: 'future',
      subjects: [
        { id: 's8-1', name: 'Trabalho de Conclusão de Curso', code: 'CMP801', credits: 8, workload: 120, status: 'pending' },
        { id: 's8-2', name: 'Estágio Supervisionado', code: 'CMP802', credits: 8, workload: 300, status: 'pending' },
        { id: 's8-3', name: 'Optativa III', code: 'OPT801', credits: 4, workload: 60, status: 'pending' },
      ],
    },
  ],
};

// ============================================
// FREE COURSES DATA
// ============================================

export const freeCourses: FreeCourse[] = [
  {
    id: 'free-001',
    title: 'Inglês para Negócios',
    description: 'Desenvolva habilidades de comunicação em inglês para o ambiente corporativo.',
    thumbnail: 'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=400&h=250&fit=crop',
    category: 'language',
    status: 'enrolled',
    workload: 60,
    instructor: 'Prof. John Smith',
    startDate: '2024-02-01',
    progress: 45,
  },
  {
    id: 'free-002',
    title: 'Design Thinking na Prática',
    description: 'Aprenda a metodologia de design thinking para resolver problemas complexos.',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=250&fit=crop',
    category: 'workshop',
    status: 'available',
    workload: 20,
    instructor: 'Profa. Marina Costa',
  },
  {
    id: 'free-003',
    title: 'Certificação AWS Cloud Practitioner',
    description: 'Prepare-se para a certificação AWS com conteúdo oficial e simulados.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    category: 'certification',
    status: 'available',
    workload: 40,
    instructor: 'Prof. Marcos Pereira',
  },
  {
    id: 'free-004',
    title: 'Espanhol Básico',
    description: 'Inicie sua jornada no idioma espanhol com foco em conversação.',
    thumbnail: 'https://images.unsplash.com/photo-1551279880-03041531948f?w=400&h=250&fit=crop',
    category: 'language',
    status: 'available',
    workload: 45,
    instructor: 'Profa. Carmen Rodriguez',
  },
  {
    id: 'free-005',
    title: 'Introdução ao Metaverso',
    description: 'Explore as possibilidades do metaverso e tecnologias imersivas.',
    thumbnail: 'https://images.unsplash.com/photo-1626379801357-e41bd7d1e784?w=400&h=250&fit=crop',
    category: 'extension',
    status: 'completed',
    workload: 15,
    instructor: 'Prof. Rafael Lima',
    progress: 100,
  },
  {
    id: 'free-006',
    title: 'Liderança e Soft Skills',
    description: 'Desenvolva habilidades de liderança e competências interpessoais.',
    thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop',
    category: 'workshop',
    status: 'enrolled',
    workload: 30,
    instructor: 'Profa. Beatriz Santos',
    startDate: '2024-01-15',
    progress: 70,
  },
  // Disciplinas do período atual como trilhas
  ...mainCourse.periods
    .find((p) => p.status === 'current')!
    .subjects.map((subject, index) => ({
      id: `course-${subject.id}`,
      title: subject.name,
      description: `Disciplina do ${mainCourse.currentPeriod}º período - ${subject.code}`,
      thumbnail: [
        'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
      ][index % 5],
      category: 'course' as const,
      status: (subject.status === 'approved' ? 'completed' : 'enrolled') as FreeCourse['status'],
      workload: subject.workload,
      instructor: subject.professor || 'A definir',
      progress: subject.status === 'in_progress' ? Math.floor(Math.random() * 60) + 20 : undefined,
    })),
];

// ============================================
// SECRETARIA - DOCUMENTOS DATA
// ============================================

export const documents: Document[] = [
  {
    id: 'doc-001',
    type: 'declaration',
    name: 'Declaração de Matrícula',
    description: 'Documento que comprova vínculo ativo com a instituição.',
    status: 'available',
    price: 0,
  },
  {
    id: 'doc-002',
    type: 'declaration',
    name: 'Declaração de Vínculo para FIES',
    description: 'Documento específico para renovação do FIES.',
    status: 'available',
    price: 0,
  },
  {
    id: 'doc-003',
    type: 'transcript',
    name: 'Histórico Escolar Parcial',
    description: 'Histórico com todas as disciplinas cursadas até o momento.',
    status: 'ready',
    requestedAt: '2024-02-01',
    readyAt: '2024-02-05',
    price: 15,
  },
  {
    id: 'doc-004',
    type: 'enrollment',
    name: 'Comprovante de Matrícula',
    description: 'Comprovante do período letivo atual.',
    status: 'available',
    price: 0,
  },
  {
    id: 'doc-005',
    type: 'transcript',
    name: 'Histórico Escolar Completo',
    description: 'Histórico oficial com todas as disciplinas e cargas horárias.',
    status: 'requested',
    requestedAt: '2024-02-10',
    price: 25,
  },
  {
    id: 'doc-006',
    type: 'certificate',
    name: 'Atestado de Conclusão de Período',
    description: 'Atestado de conclusão do período anterior.',
    status: 'available',
    price: 10,
  },
];

// ============================================
// SECRETARIA - FINANCEIRO DATA
// ============================================

export const financialItems: FinancialItem[] = [
  {
    id: 'fin-001',
    description: 'Mensalidade',
    reference: 'Março/2024',
    amount: 1250.00,
    dueDate: '2024-03-10',
    status: 'pending',
    barcode: '23793.38128 60000.000003 00000.000402 1 93210000125000',
  },
  {
    id: 'fin-002',
    description: 'Mensalidade',
    reference: 'Fevereiro/2024',
    amount: 1250.00,
    dueDate: '2024-02-10',
    status: 'paid',
    paidAt: '2024-02-08',
  },
  {
    id: 'fin-003',
    description: 'Mensalidade',
    reference: 'Janeiro/2024',
    amount: 1250.00,
    dueDate: '2024-01-10',
    status: 'paid',
    paidAt: '2024-01-09',
  },
  {
    id: 'fin-004',
    description: 'Taxa de Rematrícula',
    reference: '2024.1',
    amount: 150.00,
    dueDate: '2024-01-20',
    status: 'paid',
    paidAt: '2024-01-18',
  },
  {
    id: 'fin-005',
    description: 'Histórico Escolar',
    reference: 'Solicitação #003',
    amount: 25.00,
    dueDate: '2024-02-15',
    status: 'pending',
    barcode: '23793.38128 60000.000003 00000.000403 1 93210000002500',
  },
];

// ============================================
// SECRETARIA - MATRÍCULA DATA
// ============================================

export const enrollmentStatus: EnrollmentStatus = {
  status: 'active',
  semester: '2024.1',
  enrollmentDate: '2024-01-15',
  renewalStart: '2024-06-01',
  renewalEnd: '2024-06-30',
  canRenew: false,
};

// ============================================
// SECRETARIA - ATENDIMENTO DATA
// ============================================

export const supportTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    subject: 'Dúvida sobre emissão de histórico',
    category: 'academic',
    status: 'resolved',
    createdAt: '2024-01-20T10:30:00',
    updatedAt: '2024-01-22T14:00:00',
    messages: [
      { id: 'msg-001', sender: 'student', content: 'Olá, gostaria de saber quanto tempo demora para o histórico ficar pronto?', sentAt: '2024-01-20T10:30:00' },
      { id: 'msg-002', sender: 'support', content: 'Olá Ana! O prazo é de até 5 dias úteis após a solicitação. Você pode acompanhar o status na aba de documentos.', sentAt: '2024-01-20T15:45:00' },
      { id: 'msg-003', sender: 'student', content: 'Obrigada pelo esclarecimento!', sentAt: '2024-01-22T09:00:00' },
      { id: 'msg-004', sender: 'support', content: 'Por nada! Qualquer dúvida, estamos à disposição.', sentAt: '2024-01-22T14:00:00' },
    ],
  },
  {
    id: 'ticket-002',
    subject: 'Problema com boleto',
    category: 'financial',
    status: 'open',
    createdAt: '2024-02-08T16:20:00',
    updatedAt: '2024-02-08T16:20:00',
    messages: [
      { id: 'msg-005', sender: 'student', content: 'O boleto de março está com o valor diferente do contrato. Podem verificar?', sentAt: '2024-02-08T16:20:00' },
    ],
  },
];

export const faqs: FAQ[] = [
  {
    id: 'faq-001',
    question: 'Como solicitar um documento?',
    answer: 'Acesse a área de Documentos na Secretaria, selecione o documento desejado e clique em "Solicitar". Documentos gratuitos são gerados imediatamente, já os pagos ficam disponíveis após confirmação do pagamento.',
    category: 'documentos',
  },
  {
    id: 'faq-002',
    question: 'Qual o prazo para pagamento do boleto?',
    answer: 'Os boletos vencem no dia 10 de cada mês. Após o vencimento, são cobrados juros de 2% ao mês mais multa de 2% sobre o valor.',
    category: 'financeiro',
  },
  {
    id: 'faq-003',
    question: 'Como faço para trancar a matrícula?',
    answer: 'O trancamento pode ser solicitado pelo portal do aluno na área de Matrícula. O prazo para solicitação é até 30 dias após o início do período letivo.',
    category: 'matricula',
  },
  {
    id: 'faq-004',
    question: 'Como funciona a rematrícula?',
    answer: 'A rematrícula é feita automaticamente para alunos sem pendências. Durante o período de rematrícula (geralmente 30 dias antes do novo semestre), você pode ajustar disciplinas opcionais.',
    category: 'matricula',
  },
  {
    id: 'faq-005',
    question: 'Posso cursar disciplinas de outros períodos?',
    answer: 'Sim, desde que você tenha cumprido os pré-requisitos. Solicite na coordenação do curso durante o período de ajuste de matrícula.',
    category: 'academico',
  },
];

// ============================================
// TRAILS DATA (MANTIDO)
// ============================================

export const trails: Trail[] = [
  {
    id: 'trail-001',
    title: 'Fundamentos de Inteligência Artificial',
    description: 'Domine os conceitos essenciais de IA, desde machine learning até redes neurais, com projetos práticos.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    category: 'Tecnologia',
    totalModules: 5,
    completedModules: 3,
    totalLessons: 24,
    completedLessons: 14,
    estimatedHours: 40,
    instructor: 'Dr. Ricardo Mendes',
    status: 'in_progress',
    deadline: '2024-03-15',
    xpReward: 500,
  },
  {
    id: 'trail-002',
    title: 'Design de Experiência do Usuário',
    description: 'Aprenda a criar interfaces intuitivas e experiências memoráveis para produtos digitais.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'Design',
    totalModules: 4,
    completedModules: 4,
    totalLessons: 18,
    completedLessons: 18,
    estimatedHours: 30,
    instructor: 'Profa. Marina Costa',
    status: 'completed',
    xpReward: 400,
  },
  {
    id: 'trail-003',
    title: 'Desenvolvimento Web Full Stack',
    description: 'Do frontend ao backend: construa aplicações web completas com as tecnologias mais modernas.',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
    category: 'Tecnologia',
    totalModules: 6,
    completedModules: 1,
    totalLessons: 32,
    completedLessons: 5,
    estimatedHours: 60,
    instructor: 'Prof. Lucas Oliveira',
    status: 'in_progress',
    deadline: '2024-04-20',
    xpReward: 600,
  },
  {
    id: 'trail-004',
    title: 'Gestão de Projetos Ágeis',
    description: 'Metodologias ágeis na prática: Scrum, Kanban e frameworks para equipes de alta performance.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    category: 'Gestão',
    totalModules: 4,
    completedModules: 0,
    totalLessons: 16,
    completedLessons: 0,
    estimatedHours: 25,
    instructor: 'Profa. Beatriz Santos',
    status: 'not_started',
    xpReward: 350,
  },
  {
    id: 'trail-005',
    title: 'Ciência de Dados e Analytics',
    description: 'Transforme dados em insights: Python, SQL, visualização e machine learning aplicado.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    category: 'Dados',
    totalModules: 5,
    completedModules: 0,
    totalLessons: 28,
    completedLessons: 0,
    estimatedHours: 50,
    instructor: 'Dr. Felipe Rodrigues',
    status: 'not_started',
    xpReward: 550,
  },
];

// ============================================
// MODULES DATA (MANTIDO)
// ============================================

export const modules: Module[] = [
  {
    id: 'mod-001-1',
    trailId: 'trail-001',
    title: 'Introdução à Inteligência Artificial',
    description: 'Conceitos fundamentais e história da IA',
    order: 1,
    status: 'completed',
    lessons: [],
  },
  {
    id: 'mod-001-2',
    trailId: 'trail-001',
    title: 'Machine Learning Supervisionado',
    description: 'Algoritmos de classificação e regressão',
    order: 2,
    status: 'completed',
    lessons: [],
  },
  {
    id: 'mod-001-3',
    trailId: 'trail-001',
    title: 'Machine Learning Não-Supervisionado',
    description: 'Clustering e redução de dimensionalidade',
    order: 3,
    status: 'completed',
    lessons: [],
  },
  {
    id: 'mod-001-4',
    trailId: 'trail-001',
    title: 'Redes Neurais e Deep Learning',
    description: 'Fundamentos de redes neurais artificiais',
    order: 4,
    status: 'in_progress',
    lessons: [],
  },
  {
    id: 'mod-001-5',
    trailId: 'trail-001',
    title: 'Projeto Final de IA',
    description: 'Aplicação prática dos conceitos aprendidos',
    order: 5,
    status: 'locked',
    lessons: [],
  },
];

// ============================================
// LESSONS DATA (MANTIDO)
// ============================================

export const lessons: Lesson[] = [
  {
    id: 'lesson-001',
    moduleId: 'mod-001-4',
    title: 'O que são Redes Neurais?',
    description: 'Introdução aos conceitos básicos de redes neurais artificiais e sua inspiração biológica.',
    type: 'video',
    duration: 25,
    status: 'completed',
    order: 1,
    xpReward: 20,
    videoUrl: 'https://example.com/video1',
  },
  {
    id: 'lesson-002',
    moduleId: 'mod-001-4',
    title: 'Perceptrons e Funções de Ativação',
    description: 'Entenda o funcionamento do perceptron e as principais funções de ativação.',
    type: 'video',
    duration: 35,
    status: 'completed',
    order: 2,
    xpReward: 25,
    videoUrl: 'https://example.com/video2',
  },
  {
    id: 'lesson-003',
    moduleId: 'mod-001-4',
    title: 'Backpropagation',
    description: 'O algoritmo fundamental para treinamento de redes neurais.',
    type: 'reading',
    duration: 20,
    status: 'in_progress',
    order: 3,
    xpReward: 15,
    content: 'O algoritmo de backpropagation é fundamental para o treinamento de redes neurais...',
  },
  {
    id: 'lesson-004',
    moduleId: 'mod-001-4',
    title: 'Quiz: Fundamentos de Redes Neurais',
    description: 'Teste seus conhecimentos sobre os conceitos aprendidos.',
    type: 'quiz',
    duration: 15,
    status: 'available',
    order: 4,
    xpReward: 30,
  },
  {
    id: 'lesson-005',
    moduleId: 'mod-001-4',
    title: 'Redes Neurais Convolucionais (CNN)',
    description: 'Aprenda sobre CNNs e suas aplicações em visão computacional.',
    type: 'video',
    duration: 40,
    status: 'locked',
    order: 5,
    xpReward: 25,
  },
  {
    id: 'lesson-006',
    moduleId: 'mod-001-4',
    title: 'Projeto: Classificador de Imagens',
    description: 'Construa seu primeiro classificador de imagens usando CNN.',
    type: 'project',
    duration: 120,
    status: 'locked',
    order: 6,
    xpReward: 100,
  },
];

// ============================================
// ASSESSMENTS DATA (MANTIDO)
// ============================================

export const assessments: Assessment[] = [
  {
    id: 'assess-001',
    lessonId: 'lesson-004',
    title: 'Quiz: Fundamentos de Redes Neurais',
    type: 'quiz',
    maxGrade: 100,
    dueDate: '2024-02-28',
  },
  {
    id: 'assess-002',
    lessonId: 'lesson-006',
    title: 'Projeto: Classificador de Imagens',
    type: 'project',
    maxGrade: 100,
    dueDate: '2024-03-10',
  },
  {
    id: 'assess-003',
    lessonId: 'lesson-completed',
    title: 'Projeto Final de UX Design',
    type: 'project',
    grade: 95,
    maxGrade: 100,
    feedback: 'Excelente trabalho! O protótipo demonstra domínio dos princípios de UX.',
    submittedAt: '2024-01-20',
    dueDate: '2024-01-25',
  },
];

// ============================================
// EVIDENCES DATA (MANTIDO)
// ============================================

export const evidences: Evidence[] = [
  // Certificates
  {
    id: 'evidence-001',
    title: 'Certificado de UX Design',
    description: 'Conclusão da trilha de Design de Experiência do Usuário',
    type: 'certificate',
    imageUrl: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=400&h=300&fit=crop',
    earnedAt: '2024-01-25',
    trailId: 'trail-002',
    shareUrl: 'https://certificates.lxp.edu/ux-design-ana-silva',
    xpReward: 500,
    rarity: 'epic',
    icon: 'graduation',
    unlockedBy: 'Completar trilha de UX Design',
  },
  {
    id: 'evidence-007',
    title: 'Certificado de IA Fundamentals',
    description: 'Dominou os conceitos fundamentais de Inteligência Artificial',
    type: 'certificate',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    earnedAt: '2024-02-15',
    xpReward: 750,
    rarity: 'legendary',
    icon: 'crown',
    unlockedBy: 'Completar trilha de IA com nota acima de 90%',
  },
  
  // Badges
  {
    id: 'evidence-002',
    title: 'Primeiro Projeto',
    description: 'Conquistado ao entregar seu primeiro projeto na plataforma',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2023-09-15',
    xpReward: 50,
    rarity: 'common',
    icon: 'rocket',
    unlockedBy: 'Entregar primeiro projeto',
  },
  {
    id: 'evidence-004',
    title: 'Streak de 7 Dias',
    description: 'Estudou por 7 dias consecutivos sem parar',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2024-02-10',
    xpReward: 100,
    rarity: 'uncommon',
    icon: 'flame',
    unlockedBy: 'Manter streak de 7 dias',
  },
  {
    id: 'evidence-006',
    title: 'Top 10% da Turma',
    description: 'Entre os melhores alunos do semestre',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2023-12-15',
    xpReward: 300,
    rarity: 'epic',
    icon: 'trophy',
    unlockedBy: 'Alcançar top 10% de desempenho',
  },
  {
    id: 'evidence-008',
    title: 'Maratonista',
    description: 'Completou 10 aulas em um único dia',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2024-01-05',
    xpReward: 150,
    rarity: 'rare',
    icon: 'zap',
    unlockedBy: 'Completar 10 aulas em 24 horas',
  },
  {
    id: 'evidence-009',
    title: 'Colaborador',
    description: 'Ajudou 5 colegas no fórum de discussão',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2024-02-01',
    xpReward: 75,
    rarity: 'uncommon',
    icon: 'users',
    unlockedBy: 'Responder 5 dúvidas no fórum',
  },
  {
    id: 'evidence-010',
    title: 'Lenda Acadêmica',
    description: 'Completou todas as trilhas disponíveis com excelência',
    type: 'badge',
    imageUrl: '',
    earnedAt: '2024-02-20',
    xpReward: 1000,
    rarity: 'legendary',
    icon: 'gem',
    unlockedBy: 'Completar 100% das trilhas com nota A',
  },
  
  // Projects
  {
    id: 'evidence-003',
    title: 'App de Saúde Mental',
    description: 'Projeto final da trilha de UX Design - aplicativo para bem-estar',
    type: 'project',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
    earnedAt: '2024-01-20',
    trailId: 'trail-002',
    xpReward: 200,
    rarity: 'rare',
    icon: 'heart',
    unlockedBy: 'Entregar projeto final de UX Design',
  },
  {
    id: 'evidence-011',
    title: 'Classificador de Imagens',
    description: 'Modelo de ML para classificação de imagens com 95% de precisão',
    type: 'project',
    imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=300&fit=crop',
    earnedAt: '2024-02-18',
    xpReward: 350,
    rarity: 'epic',
    icon: 'target',
    unlockedBy: 'Projeto de IA com precisão acima de 90%',
  },
  
  // Participation
  {
    id: 'evidence-005',
    title: 'Hackathon de IA',
    description: 'Evento universitário de inovação em Inteligência Artificial',
    type: 'participation',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
    earnedAt: '2023-11-20',
    xpReward: 100,
    rarity: 'rare',
    icon: 'sparkles',
    unlockedBy: 'Participar do Hackathon de IA',
  },
  {
    id: 'evidence-012',
    title: 'Workshop de Design',
    description: 'Participação no workshop de Design Thinking com especialistas',
    type: 'participation',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    earnedAt: '2024-01-10',
    xpReward: 50,
    rarity: 'uncommon',
    icon: 'book',
    unlockedBy: 'Participar de workshop oficial',
  },
];

// ============================================
// ACTIVITIES DATA (MANTIDO)
// ============================================

export const upcomingActivities: Activity[] = [
  {
    id: 'activity-001',
    title: 'Quiz: Fundamentos de Redes Neurais',
    type: 'quiz',
    trailTitle: 'Fundamentos de IA',
    dueDate: '2024-02-28',
    status: 'pending',
  },
  {
    id: 'activity-002',
    title: 'Projeto: Classificador de Imagens',
    type: 'project',
    trailTitle: 'Fundamentos de IA',
    dueDate: '2024-03-10',
    status: 'pending',
  },
  {
    id: 'activity-003',
    title: 'Aula: APIs RESTful',
    type: 'lesson',
    trailTitle: 'Dev Web Full Stack',
    dueDate: '2024-02-25',
    status: 'pending',
  },
];

// ============================================
// CHART DATA (MANTIDO)
// ============================================

export const weeklyStudyData = [
  { day: 'Seg', hours: 2.5 },
  { day: 'Ter', hours: 1.5 },
  { day: 'Qua', hours: 3.0 },
  { day: 'Qui', hours: 2.0 },
  { day: 'Sex', hours: 1.0 },
  { day: 'Sáb', hours: 4.0 },
  { day: 'Dom', hours: 2.0 },
];

export const monthlyProgressData = [
  { week: 'Sem 1', lessons: 8, hours: 12 },
  { week: 'Sem 2', lessons: 5, hours: 8 },
  { week: 'Sem 3', lessons: 10, hours: 15 },
  { week: 'Sem 4', lessons: 7, hours: 10 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getTrailProgress = (trail: Trail): number => {
  if (trail.totalLessons === 0) return 0;
  return Math.round((trail.completedLessons / trail.totalLessons) * 100);
};

export const getModulesByTrailId = (trailId: string): Module[] => {
  return modules.filter((m) => m.trailId === trailId);
};

export const getLessonsByModuleId = (moduleId: string): Lesson[] => {
  return lessons.filter((l) => l.moduleId === moduleId);
};

export const getTrailById = (id: string): Trail | undefined => {
  return trails.find((t) => t.id === id);
};

export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find((l) => l.id === id);
};

export const getEvidencesByType = (type: Evidence['type']): Evidence[] => {
  return evidences.filter((e) => e.type === type);
};

export const getStudentStats = () => ({
  totalTrails: trails.length,
  completedTrails: trails.filter((t) => t.status === 'completed').length,
  inProgressTrails: trails.filter((t) => t.status === 'in_progress').length,
  totalLessonsCompleted: trails.reduce((acc, t) => acc + t.completedLessons, 0),
  totalHoursStudied: 45,
  averageGrade: 8.2,
  totalXp: currentStudent.xp,
  level: currentStudent.level,
  streak: currentStudent.streak,
  totalCredits: mainCourse.periods
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + p.subjects.reduce((a, s) => a + s.credits, 0), 0),
});

export const getCourseProgress = () => {
  const completedPeriods = mainCourse.periods.filter((p) => p.status === 'completed').length;
  return Math.round((completedPeriods / mainCourse.totalPeriods) * 100);
};

export const getFinancialSummary = () => {
  const pending = financialItems.filter((f) => f.status === 'pending');
  const overdue = financialItems.filter((f) => f.status === 'overdue');
  return {
    pendingCount: pending.length,
    pendingTotal: pending.reduce((acc, f) => acc + f.amount, 0),
    overdueCount: overdue.length,
    overdueTotal: overdue.reduce((acc, f) => acc + f.amount, 0),
  };
};

// ============================================
// TRAIL MILESTONES - CRONOGRAMA
// ============================================

export interface TrailMilestone {
  id: string;
  trailId: string;
  title: string;
  type: 'lesson_release' | 'activity_deadline' | 'quiz' | 'exam' | 'project_deadline';
  date: string;
  lessonId?: string;
  moduleId?: string;
}

export const trailMilestones: TrailMilestone[] = [
  {
    id: 'milestone-001',
    trailId: 'trail-001',
    title: 'Liberação: Redes Neurais Convolucionais',
    type: 'lesson_release',
    date: '2026-01-20',
    moduleId: 'mod-001-3',
  },
  {
    id: 'milestone-002',
    trailId: 'trail-001',
    title: 'Quiz: Fundamentos de Redes Neurais',
    type: 'quiz',
    date: '2026-01-25',
    moduleId: 'mod-001-2',
  },
  {
    id: 'milestone-003',
    trailId: 'trail-001',
    title: 'Entrega: Projeto Classificador de Imagens',
    type: 'project_deadline',
    date: '2026-02-01',
    moduleId: 'mod-001-3',
  },
  {
    id: 'milestone-004',
    trailId: 'trail-001',
    title: 'Prova: Avaliação do Módulo 3',
    type: 'exam',
    date: '2026-02-05',
    moduleId: 'mod-001-3',
  },
  {
    id: 'milestone-005',
    trailId: 'trail-001',
    title: 'Liberação: Módulo 5 - Transfer Learning',
    type: 'lesson_release',
    date: '2026-02-10',
    moduleId: 'mod-001-5',
  },
  {
    id: 'milestone-006',
    trailId: 'trail-001',
    title: 'Atividade: Exercícios de Reforço',
    type: 'activity_deadline',
    date: '2026-01-28',
    moduleId: 'mod-001-2',
  },
  {
    id: 'milestone-007',
    trailId: 'trail-001',
    title: 'Quiz: Arquiteturas de CNNs',
    type: 'quiz',
    date: '2026-02-15',
    moduleId: 'mod-001-4',
  },
  {
    id: 'milestone-008',
    trailId: 'trail-001',
    title: 'Prova Final: Deep Learning',
    type: 'exam',
    date: '2026-02-28',
  },
];

export const getMilestonesByTrailId = (trailId: string): TrailMilestone[] => {
  return trailMilestones.filter((m) => m.trailId === trailId);
};

// ============================================
// LESSON NAVIGATION HELPERS
// ============================================

export const getModuleByLessonId = (lessonId: string): Module | undefined => {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return modules.find((m) => m.id === lesson.moduleId);
};

export const getLessonsForTrail = (trailId: string): Lesson[] => {
  const trailModules = modules.filter((m) => m.trailId === trailId);
  const moduleIds = trailModules.map((m) => m.id);
  return lessons.filter((l) => moduleIds.includes(l.moduleId)).sort((a, b) => {
    const moduleA = trailModules.find((m) => m.id === a.moduleId);
    const moduleB = trailModules.find((m) => m.id === b.moduleId);
    if (!moduleA || !moduleB) return 0;
    if (moduleA.order !== moduleB.order) return moduleA.order - moduleB.order;
    return a.order - b.order;
  });
};

export const getAdjacentLessons = (trailId: string, currentLessonId: string): { prev: Lesson | null; next: Lesson | null } => {
  const trailLessons = getLessonsForTrail(trailId);
  const currentIndex = trailLessons.findIndex((l) => l.id === currentLessonId);
  
  return {
    prev: currentIndex > 0 ? trailLessons[currentIndex - 1] : null,
    next: currentIndex < trailLessons.length - 1 ? trailLessons[currentIndex + 1] : null,
  };
};

export const getTrailProgressByLessons = (trailId: string): number => {
  const trailLessons = getLessonsForTrail(trailId);
  if (trailLessons.length === 0) return 0;
  const completed = trailLessons.filter((l) => l.status === 'completed').length;
  return Math.round((completed / trailLessons.length) * 100);
};
