import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { BIBLE_BOOKS, QUIZ_TOPICS } from '@/lib/bible-data'
import { Question, Difficulty } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userId: string
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    if (!payload.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = payload.sub
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { difficulty, mode, bookId, topicId, count = 10 } = await request.json()

  // Build context label
  let context = ''
  if (mode === 'book' && bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId)
    context = `книга "${book?.name || bookId}"`
  } else if (mode === 'topic' && topicId) {
    const topic = QUIZ_TOPICS.find(t => t.id === topicId)
    context = `тема "${topic?.label || topicId}"`
  }

  // Fetch recent questions for this user+topic to avoid repeats
  let usedQuestions: string[] = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    )

    const filter = mode === 'book'
      ? { column: 'book_id', value: bookId }
      : { column: 'topic_id', value: topicId }

    const { data: recentResults } = await supabase
      .from('quiz_results')
      .select('questions')
      .eq('user_id', userId)
      .eq(filter.column, filter.value)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentResults) {
      const seen = new Set<string>()
      for (const row of recentResults) {
        const qs: Question[] = row.questions || []
        for (const q of qs) {
          if (q.text && !seen.has(q.text)) {
            seen.add(q.text)
            usedQuestions.push(q.text)
          }
        }
      }
      // Cap at 40 to avoid prompt bloat
      usedQuestions = usedQuestions.slice(0, 40)
    }
  } catch {
    // Non-fatal — continue without history
  }

  const difficultyInstructions = {
    easy: 'Прості питання про добре відомі події, персонажів та вірші. Підходить для початківців.',
    medium: 'Питання середньої складності про конкретні деталі, числа, імена, послідовність подій.',
    hard: 'Складні питання: маловідомі деталі, точні цитати, богословські концепції, паралелі між книгами.',
  }

  const avoidSection = usedQuestions.length > 0
    ? `\nУНИКАЙ цих питань (вже задавались раніше):\n${usedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`
    : ''

  const prompt = `Ти — експерт із Біблії. Створи ${count} тестових питань по ${context || 'всій Біблії'}.

Рівень складності: ${difficulty} — ${difficultyInstructions[difficulty as Difficulty]}
${avoidSection}
ВИМОГИ:
- Мова: українська
- Кожне питання має 4 варіанти відповіді (A, B, C, D)
- Лише одна відповідь правильна
- Додай посилання на конкретний вірш (наприклад: "Буття 1:1")
- Додай коротке пояснення (1-2 речення) чому відповідь правильна
- Питання повинні бути різноманітними — охоплюй різні аспекти теми

Відповідай ЛИШЕ у такому JSON форматі (без markdown, без коментарів):
{
  "questions": [
    {
      "id": "q1",
      "text": "Текст питання?",
      "options": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
      "correctIndex": 0,
      "explanation": "Пояснення правильної відповіді.",
      "reference": "Буття 1:1"
    }
  ]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json({ questions: parsed.questions as Question[] })
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json({ error: 'Не вдалось згенерувати питання' }, { status: 500 })
  }
}
