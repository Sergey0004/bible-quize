import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  const body = await request.json()
  const { difficulty, mode, bookId, topicId, totalQuestions, correctAnswers, score, timeSpent, questions, answers } = body

  const { data, error } = await supabase.from('quiz_results').insert({
    user_id: userId,
    difficulty,
    mode,
    book_id: bookId || null,
    topic_id: topicId || null,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    score,
    time_spent: timeSpent,
    questions,
    answers,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: data })
}
