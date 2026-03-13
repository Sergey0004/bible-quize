import { BibleBook, QuizTopic } from '@/types'

export const BIBLE_BOOKS: BibleBook[] = [
  // Старий заповіт
  { id: 'genesis', name: 'Буття', testament: 'old', chapters: 50 },
  { id: 'exodus', name: 'Вихід', testament: 'old', chapters: 40 },
  { id: 'leviticus', name: 'Левит', testament: 'old', chapters: 27 },
  { id: 'numbers', name: 'Числа', testament: 'old', chapters: 36 },
  { id: 'deuteronomy', name: 'Повторення закону', testament: 'old', chapters: 34 },
  { id: 'joshua', name: 'Ісус Навин', testament: 'old', chapters: 24 },
  { id: 'judges', name: 'Судді', testament: 'old', chapters: 21 },
  { id: 'ruth', name: 'Рут', testament: 'old', chapters: 4 },
  { id: '1samuel', name: '1 Самуїла', testament: 'old', chapters: 31 },
  { id: '2samuel', name: '2 Самуїла', testament: 'old', chapters: 24 },
  { id: '1kings', name: '1 Царів', testament: 'old', chapters: 22 },
  { id: '2kings', name: '2 Царів', testament: 'old', chapters: 25 },
  { id: 'psalms', name: 'Псалми', testament: 'old', chapters: 150 },
  { id: 'proverbs', name: 'Приповісті', testament: 'old', chapters: 31 },
  { id: 'isaiah', name: 'Ісая', testament: 'old', chapters: 66 },
  { id: 'jeremiah', name: 'Єремія', testament: 'old', chapters: 52 },
  { id: 'daniel', name: 'Даниїл', testament: 'old', chapters: 12 },
  { id: 'jonah', name: 'Йона', testament: 'old', chapters: 4 },
  // Новий заповіт
  { id: 'matthew', name: 'Від Матвія', testament: 'new', chapters: 28 },
  { id: 'mark', name: 'Від Марка', testament: 'new', chapters: 16 },
  { id: 'luke', name: 'Від Луки', testament: 'new', chapters: 24 },
  { id: 'john', name: 'Від Івана', testament: 'new', chapters: 21 },
  { id: 'acts', name: 'Дії апостолів', testament: 'new', chapters: 28 },
  { id: 'romans', name: 'Римлян', testament: 'new', chapters: 16 },
  { id: '1corinthians', name: '1 Коринтян', testament: 'new', chapters: 16 },
  { id: '2corinthians', name: '2 Коринтян', testament: 'new', chapters: 13 },
  { id: 'galatians', name: 'Галатів', testament: 'new', chapters: 6 },
  { id: 'ephesians', name: 'Ефесян', testament: 'new', chapters: 6 },
  { id: 'philippians', name: 'Филип\'ян', testament: 'new', chapters: 4 },
  { id: 'revelation', name: 'Одкровення', testament: 'new', chapters: 22 },
]

export const QUIZ_TOPICS: QuizTopic[] = [
  { id: 'creation', label: 'Створення світу', icon: '🌍' },
  { id: 'miracles', label: 'Чудеса', icon: '✨' },
  { id: 'parables', label: 'Притчі Ісуса', icon: '📖' },
  { id: 'prophets', label: 'Пророки', icon: '🔥' },
  { id: 'apostles', label: 'Апостоли', icon: '⚓' },
  { id: 'life-of-jesus', label: 'Життя Ісуса', icon: '✝️' },
  { id: 'ten-commandments', label: 'Десять заповідей', icon: '📜' },
  { id: 'prayer', label: 'Молитва', icon: '🙏' },
  { id: 'faith-heroes', label: 'Герої віри', icon: '🦁' },
  { id: 'salvation', label: 'Спасіння', icon: '💫' },
]

export const DIFFICULTY_LABELS = {
  easy: { label: 'Легкий', description: 'Базові знання Біблії', color: 'text-green-400' },
  medium: { label: 'Середній', description: 'Деталі та події', color: 'text-yellow-400' },
  hard: { label: 'Складний', description: 'Глибоке знання', color: 'text-red-400' },
}
