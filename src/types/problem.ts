export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProgrammingLanguage = 'CPP' | 'JAVA' | 'PYTHON';

export interface PageResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface TagDto {
  id: number;
  name: string;
}

export interface ProblemSummaryAdmin {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestcaseAdmin {
  id: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
  explanation: string | null;
}

export interface AIContextData {
  algorithmicConcept: string;
  predefinedHints: string;
  edgeCasesToRemind: string;
}

export interface ProblemDetailAdmin {
  id: number;
  slug: string;
  title: string;
  statement: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  modelSolutionCode: string | null;
  modelSolutionLanguage: ProgrammingLanguage | null;
  tags: TagDto[];
  testcases: TestcaseAdmin[];
  aiContext: AIContextData | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestcaseInput {
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  orderIndex?: number;
  explanation?: string | null;
}

export interface RunTestcasesRequest {
  language: ProgrammingLanguage;
  authorSolution: string;
  testCases: TestcaseInput[];
}
