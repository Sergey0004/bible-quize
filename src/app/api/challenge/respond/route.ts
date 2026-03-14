import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { QUIZ_TOPICS } from '@/lib/bible-data'
import { Question, Difficulty } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userId: string
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    userId = payload.sub
    if (!userId) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { challengeId, action } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  if (action === 'decline') {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId)
      .eq('challenged_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // action === 'accept' — generate shared questions
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .eq('challenged_id', userId)
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

  const { difficulty, topic_id, question_count } = challenge

  let context = ''
  if (topic_id) {
    const topic = QUIZ_TOPICS.find(t => t.id === topic_id)
    context = `тема "${topic?.label || topic_id}"`
  }

  const difficultyInstructions: Record<string, string> = {
    easy: 'Прості питання про добре відомі події, персонажів та вірші. Підходить для початківців.',
    medium: 'Питання середньої складності про конкретні деталі, числа, імена, послідовність подій.',
    hard: 'Складні питання: маловідомі деталі, точні цитати, богословські концепції, паралелі між книгами.',
  }

  const prompt = `Ти — експерт із Біблії. Створи ${question_count} тестових питань по ${context || 'всій Біблії'}.

Рівень складності: ${difficulty} — ${difficultyInstructions[difficulty as Difficulty] || ''}

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
    const questions: Question[] = parsed.questions

    const { error } = await supabase
      .from('challenges')
      .update({ status: 'accepted', questions })
      .eq('id', challengeId)
      .eq('challenged_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Question generation error:', err)
    return NextResponse.json({ error: 'Не вдалось згенерувати питання' }, { status: 500 })
  }
}
