export type HintLevel = 1 | 2 | 3 | 4 | 5;

export type MathTopic =
  | 'algebra'
  | 'geometry'
  | 'trigonometry'
  | 'calculus'
  | 'statistics'
  | 'number-theory'
  | 'linear-algebra'
  | 'arithmetic';

export interface Problem {
  id: string;
  originalText: string;
  imageUrl?: string;
  topic: MathTopic;
  subTopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: ProblemStep[];
  createdAt: Date;
}

export interface ProblemStep {
  id: string;
  order: number;
  description: string;
  hint: string;
  question: string;
  expectedConcept: string;
  isCompleted: boolean;
  studentAnswer?: string;
  isCorrect?: boolean;
}

export interface HintResponse {
  level: HintLevel;
  content: string;
  question?: string;
  isLastHint: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'hint' | 'question' | 'feedback' | 'concept-check';
  metadata?: {
    hintLevel?: HintLevel;
    stepNumber?: number;
    isCorrect?: boolean;
  };
}

export interface TutorSession {
  id: string;
  problem: Problem | null;
  messages: Message[];
  currentStep: number;
  currentHintLevel: HintLevel;
  hintsUsed: number;
  attemptsMade: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'abandoned';
}

export interface StudentProgress {
  id: string;
  totalProblemsAttempted: number;
  totalProblemsCompleted: number;
  topicStats: Record<MathTopic, TopicStats>;
  streakDays: number;
  lastActiveDate: string;
  hintsUsedHistory: number[];
  averageHintsPerProblem: number;
}

export interface TopicStats {
  attempted: number;
  completed: number;
  averageHints: number;
  strongAreas: string[];
  weakAreas: string[];
  lastPracticed?: Date;
}

export interface ConceptCheckQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  relatedConcept: string;
}

export interface AnalysisResult {
  topic: MathTopic;
  subTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: {
    description: string;
    hint: string;
    question: string;
    expectedConcept: string;
  }[];
  conceptsInvolved: string[];
  commonMistakes: string[];
}

export interface StepCheckResult {
  isCorrect: boolean;
  feedback: string;
  correctApproach?: string;
  encouragement: string;
}

export interface SimilarExample {
  problem: string;
  solution: string;
  steps: string[];
}
