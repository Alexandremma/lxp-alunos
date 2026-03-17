

## Adicionar aba do curso principal na pagina "Minhas Trilhas"

### O que sera feito

Adicionar uma nova aba/categoria na pagina de "Minhas Trilhas" (`/cursos-livres`) com o nome do curso principal do aluno (ex: "Ciencia da Computacao"). Essa aba mostrara as disciplinas do periodo atual como "trilhas" disponiveis, conectando a grade curricular ao formato de trilhas de aprendizagem.

### Mudancas

**1. Atualizar o tipo `FreeCourse` (mockData.ts)**
- Adicionar `'course'` como nova opcao no campo `category`

**2. Criar dados mock das disciplinas como trilhas (mockData.ts)**
- Converter as disciplinas do periodo atual (`5o Periodo`) do `mainCourse` em objetos `FreeCourse` com `category: 'course'`
- Cada disciplina vira um card com thumbnail, professor, carga horaria e status `enrolled`
- Adicionar esses itens ao array `freeCourses`

**3. Atualizar a pagina FreeCourses.tsx**
- Adicionar `'course'` ao tipo `FilterType`
- Adicionar configuracao da nova categoria em `categoryConfig` com icone `GraduationCap` e label dinamico vindo de `mainCourse.name`
- Adicionar a nova aba no `TabsList` com o nome do curso (ex: "Ciencia da Computacao (5)")
- Atualizar o calculo de `counts` para incluir a nova categoria

### Detalhes tecnicos

- O nome da aba sera dinamico, usando `mainCourse.name` importado de `mockData.ts`
- As disciplinas do periodo atual serao convertidas em `FreeCourse` com:
  - `category: 'course'`
  - `status: 'enrolled'` (para as `in_progress`) ou `'completed'` (para as `approved`)
  - `thumbnail`: imagens genericas de tecnologia/educacao
  - `instructor`: campo `professor` da disciplina
  - `workload`: campo `workload` da disciplina
- O icone da categoria sera `GraduationCap` do lucide-react
- A cor seguira o padrao existente (ex: `bg-secondary/10 text-secondary border-secondary/20`)

