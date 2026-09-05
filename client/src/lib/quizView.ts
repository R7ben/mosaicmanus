export type TeacherQuestionRecord = {
  id: string;
  topic: string;
  questionText: string;
  isActive: boolean;
  createdAt: string;
};

export type QuizLibraryCard = {
  id: string;
  title: string;
  topic?: string;
  status?: string;
  questionCount: number;
  published?: boolean;
  score?: string;
  isTeacherQuestion?: boolean;
};

export function toTeacherQuestionCard(question: TeacherQuestionRecord): QuizLibraryCard {
  return {
    id: `teacher-question-${question.id}`,
    title: question.questionText,
    topic: question.topic,
    status: question.isActive ? "Active" : "Draft",
    questionCount: 1,
    published: question.isActive,
    isTeacherQuestion: true,
  };
}

export function mergeTeacherQuestions(
  quizzes: QuizLibraryCard[],
  teacherQuestions: TeacherQuestionRecord[],
): QuizLibraryCard[] {
  return [...quizzes, ...teacherQuestions.map(toTeacherQuestionCard)];
}
