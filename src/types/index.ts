export type Difficulty = 'easy' | 'medium' | 'hard'

export type BibleBook = {
  id: string
  name: string
  testament: 'old' | 'new'
  chapters: number
}

export type QuizTopic = {
  id: string
  label: string
  icon: string
}

export type Question = {
  id: string
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  reference: string // e.g. "Буття 1:1"
}

export type QuizSession = {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startedAt: Date
  settings: QuizSettings
}

export type QuizSettings = {
  difficulty: Difficulty
  mode: 'book' | 'topic'
  bookId?: string
  topicId?: string
  questionCount: number
}

export type QuizResult = {
  totalQuestions: number
  correctAnswers: number
  score: number // 0-100
  timeSpent: number // seconds
  questions: Question[]
  answers: (number | null)[]
}

export type Profile = {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  total_quizzes: number
  total_correct: number
  best_score: number
  created_at: string
}
