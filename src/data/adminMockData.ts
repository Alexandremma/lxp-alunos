// ============================================
// MOCK DATA - Back Office / Admin
// ============================================

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  total_modules: number;
  total_lessons: number;
  estimated_hours: number;
  xp_reward: number;
  instructor: string;
  b42_api_id?: string;
  status: 'active' | 'inactive';
  enrolled_students: number;
  created_at: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  total_xp: number;
  level: number;
  enrollment_status: 'linked' | 'not_linked';
  external_enrollment_id?: string;
  external_student_id?: string;
  linked_at?: string;
  linked_by?: string;
  courses_count: number;
}

export interface ExternalEnrollment {
  id: string;
  enrollment_id: string;
  student_name: string;
  student_id: string;
  student_email?: string;
  status: 'active' | 'inactive' | 'suspended';
  courses: ExternalCourse[];
  enrollment_date: string;
}

export interface ExternalCourse {
  id: string;
  name: string;
  code: string;
  semester: string;
  status: 'enrolled' | 'completed' | 'dropped';
}

// ============================================
// ADMIN COURSES DATA
// ============================================

export const adminCourses: AdminCourse[] = [
  {
    id: 'course-001',
    title: 'Fundamentos de Inteligência Artificial',
    description: 'Domine os conceitos essenciais de IA, desde machine learning até redes neurais.',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    category: 'Tecnologia',
    total_modules: 5,
    total_lessons: 24,
    estimated_hours: 40,
    xp_reward: 500,
    instructor: 'Dr. Ricardo Mendes',
    b42_api_id: 'b42-ai-001',
    status: 'active',
    enrolled_students: 145,
    created_at: '2024-01-15',
  },
  {
    id: 'course-002',
    title: 'Design de Experiência do Usuário',
    description: 'Aprenda a criar interfaces intuitivas e experiências memoráveis.',
    thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'Design',
    total_modules: 4,
    total_lessons: 18,
    estimated_hours: 30,
    xp_reward: 400,
    instructor: 'Profa. Marina Costa',
    b42_api_id: 'b42-ux-001',
    status: 'active',
    enrolled_students: 98,
    created_at: '2024-01-10',
  },
  {
    id: 'course-003',
    title: 'Desenvolvimento Web Full Stack',
    description: 'Do frontend ao backend: construa aplicações web completas.',
    thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
    category: 'Tecnologia',
    total_modules: 6,
    total_lessons: 32,
    estimated_hours: 60,
    xp_reward: 600,
    instructor: 'Prof. Lucas Oliveira',
    b42_api_id: 'b42-web-001',
    status: 'active',
    enrolled_students: 203,
    created_at: '2024-01-20',
  },
  {
    id: 'course-004',
    title: 'Gestão de Projetos Ágeis',
    description: 'Metodologias ágeis na prática: Scrum, Kanban e frameworks.',
    thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    category: 'Gestão',
    total_modules: 4,
    total_lessons: 16,
    estimated_hours: 25,
    xp_reward: 350,
    instructor: 'Profa. Beatriz Santos',
    b42_api_id: 'b42-agile-001',
    status: 'active',
    enrolled_students: 67,
    created_at: '2024-02-01',
  },
  {
    id: 'course-005',
    title: 'Ciência de Dados e Analytics',
    description: 'Transforme dados em insights: Python, SQL, visualização e ML.',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    category: 'Dados',
    total_modules: 5,
    total_lessons: 28,
    estimated_hours: 50,
    xp_reward: 550,
    instructor: 'Dr. Felipe Rodrigues',
    b42_api_id: 'b42-data-001',
    status: 'active',
    enrolled_students: 0,
    created_at: '2024-02-15',
  },
];

// ============================================
// ADMIN STUDENTS DATA
// ============================================

export const adminStudents: AdminStudent[] = [
  {
    id: 'student-001',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-01-15',
    total_xp: 2450,
    level: 12,
    enrollment_status: 'linked',
    external_enrollment_id: 'ENR-2024-001',
    external_student_id: 'EXT-STU-001',
    linked_at: '2024-01-16',
    linked_by: 'admin-001',
    courses_count: 3,
  },
  {
    id: 'student-002',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.santos@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-01-20',
    total_xp: 1890,
    level: 9,
    enrollment_status: 'linked',
    external_enrollment_id: 'ENR-2024-002',
    external_student_id: 'EXT-STU-002',
    linked_at: '2024-01-21',
    linked_by: 'admin-001',
    courses_count: 2,
  },
  {
    id: 'student-003',
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-02-01',
    total_xp: 3200,
    level: 15,
    enrollment_status: 'linked',
    external_enrollment_id: 'ENR-2024-003',
    external_student_id: 'EXT-STU-003',
    linked_at: '2024-02-02',
    linked_by: 'admin-002',
    courses_count: 4,
  },
  {
    id: 'student-004',
    name: 'João Pedro Lima',
    email: 'joao.lima@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-02-05',
    total_xp: 450,
    level: 3,
    enrollment_status: 'not_linked',
    courses_count: 0,
  },
  {
    id: 'student-005',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-02-10',
    total_xp: 1200,
    level: 6,
    enrollment_status: 'not_linked',
    courses_count: 1,
  },
  {
    id: 'student-006',
    name: 'Rafael Mendes',
    email: 'rafael.mendes@universidade.edu.br',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    created_at: '2024-02-12',
    total_xp: 890,
    level: 5,
    enrollment_status: 'linked',
    external_enrollment_id: 'ENR-2024-004',
    external_student_id: 'EXT-STU-004',
    linked_at: '2024-02-13',
    linked_by: 'admin-001',
    courses_count: 2,
  },
];

// ============================================
// EXTERNAL ENROLLMENTS DATA (API Externa)
// ============================================

export const externalEnrollments: ExternalEnrollment[] = [
  {
    id: 'ext-enr-001',
    enrollment_id: 'ENR-2024-001',
    student_name: 'Ana Carolina Silva',
    student_id: 'EXT-STU-001',
    student_email: 'ana.silva@universidade.edu.br',
    status: 'active',
    courses: [
      { id: 'ext-course-001', name: 'Fundamentos de IA', code: 'CMP501', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-002', name: 'Desenvolvimento Web', code: 'CMP503', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-003', name: 'UX Design', code: 'CMP405', semester: '2024.1', status: 'enrolled' },
    ],
    enrollment_date: '2024-01-15',
  },
  {
    id: 'ext-enr-002',
    enrollment_id: 'ENR-2024-002',
    student_name: 'Carlos Eduardo Santos',
    student_id: 'EXT-STU-002',
    student_email: 'carlos.santos@universidade.edu.br',
    status: 'active',
    courses: [
      { id: 'ext-course-001', name: 'Fundamentos de IA', code: 'CMP501', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-004', name: 'Gestão de Projetos', code: 'CMP604', semester: '2024.1', status: 'enrolled' },
    ],
    enrollment_date: '2024-01-20',
  },
  {
    id: 'ext-enr-003',
    enrollment_id: 'ENR-2024-003',
    student_name: 'Mariana Oliveira',
    student_id: 'EXT-STU-003',
    student_email: 'mariana.oliveira@universidade.edu.br',
    status: 'active',
    courses: [
      { id: 'ext-course-001', name: 'Fundamentos de IA', code: 'CMP501', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-002', name: 'Desenvolvimento Web', code: 'CMP503', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-003', name: 'UX Design', code: 'CMP405', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-005', name: 'Ciência de Dados', code: 'CMP601', semester: '2024.1', status: 'enrolled' },
    ],
    enrollment_date: '2024-02-01',
  },
  {
    id: 'ext-enr-004',
    enrollment_id: 'ENR-2024-004',
    student_name: 'Rafael Mendes',
    student_id: 'EXT-STU-004',
    student_email: 'rafael.mendes@universidade.edu.br',
    status: 'active',
    courses: [
      { id: 'ext-course-001', name: 'Fundamentos de IA', code: 'CMP501', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-004', name: 'Gestão de Projetos', code: 'CMP604', semester: '2024.1', status: 'enrolled' },
    ],
    enrollment_date: '2024-02-12',
  },
  {
    id: 'ext-enr-005',
    enrollment_id: 'ENR-2024-005',
    student_name: 'Patricia Alves',
    student_id: 'EXT-STU-005',
    student_email: 'patricia.alves@universidade.edu.br',
    status: 'active',
    courses: [
      { id: 'ext-course-002', name: 'Desenvolvimento Web', code: 'CMP503', semester: '2024.1', status: 'enrolled' },
      { id: 'ext-course-003', name: 'UX Design', code: 'CMP405', semester: '2024.1', status: 'enrolled' },
    ],
    enrollment_date: '2024-02-14',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAdminStats = () => ({
  totalCourses: adminCourses.length,
  activeCourses: adminCourses.filter((c) => c.status === 'active').length,
  totalStudents: adminStudents.length,
  linkedStudents: adminStudents.filter((s) => s.enrollment_status === 'linked').length,
  totalEnrollments: adminStudents.reduce((acc, s) => acc + s.courses_count, 0),
});

export const searchExternalEnrollments = (query: string): ExternalEnrollment[] => {
  const lowerQuery = query.toLowerCase();
  return externalEnrollments.filter(
    (enr) =>
      enr.enrollment_id.toLowerCase().includes(lowerQuery) ||
      enr.student_name.toLowerCase().includes(lowerQuery) ||
      enr.student_id.toLowerCase().includes(lowerQuery) ||
      enr.student_email?.toLowerCase().includes(lowerQuery)
  );
};

export const getExternalEnrollmentById = (enrollmentId: string): ExternalEnrollment | undefined => {
  return externalEnrollments.find((enr) => enr.enrollment_id === enrollmentId);
};
