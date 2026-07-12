export type LibraryContentType = "discipline"

export type LibraryItem = {
  id: string
  name: string
  type: LibraryContentType
  description?: string
  tags?: string[]
  duration?: string
  modulesCount?: number
  lessonsCount?: number
  category?: "course" | "language" | "workshop" | "certification" | "extension"
  progressPercent?: number
  isComplete?: boolean
  enrolled?: boolean
  /** Disciplina inativa no backoffice — exibe "Disciplina inativa" */
  disciplineInactive?: boolean
  /** Matrícula inativa neste curso — bloqueia acesso */
  enrollmentInactive?: boolean
  professor?: string
  workloadHours?: number
  credits?: number
  courseId?: string
  courseName?: string
}

export type SearchLibraryParams = {
  q?: string
  type?: LibraryContentType | "all"
  page?: number
  pageSize?: number
}

export type SearchLibraryResponse = {
  items: LibraryItem[]
  total: number
}
