import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let challengerId: string
  let challengerEmail: string
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    challengerId = payload.sub
    challengerEmail = payload.email
    if (!challengerId) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { challengedEmail, topicId, topicLabel, difficulty, questionCount } = await request.json()

  if (!challengedEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  if (challengedEmail.toLowerCase() === challengerEmail?.toLowerCase()) {
    return NextResponse.json({ error: 'Не можна кидати виклик собі' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  const { data: challengerProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', challengerId)
    .single()

  const { data: challengedProfile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('email', challengedEmail.toLowerCase())
    .single()

  if (!challengedProfile) {
    return NextResponse.json({ error: 'Користувача з таким email не знайдено' }, { status: 404 })
  }

  const { data: challenge, error: createError } = await supabase
    .from('challenges')
    .insert({
      challenger_id: challengerId,
      challenged_id: challengedProfile.id,
      challenger_email: challengerEmail.toLowerCase(),
      challenged_email: challengedEmail.toLowerCase(),
      challenger_name: challengerProfile?.display_name || 'Гравець',
      topic_id: topicId || null,
      difficulty: difficulty || 'medium',
      question_count: questionCount || 10,
    })
    .select()
    .single()

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const challengeUrl = `${siteUrl}/challenge/${challenge.id}`
  const challengerName = challengerProfile?.display_name || 'Гравець'
  const diffLabels: Record<string, string> = { easy: 'Легкий', medium: 'Середній', hard: 'Складний' }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: challengedEmail,
      subject: `${challengerName} кидає вам виклик у BibleQuiz! ⚔️`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #faf8f3; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #b45309; font-size: 28px; margin: 0;">⚔️ Виклик!</h1>
          </div>
          <p style="font-size: 17px; color: #333; line-height: 1.6; margin-bottom: 16px;">
            <strong>${challengerName}</strong> кидає вам виклик у <strong>BibleQuiz</strong>!
          </p>
          <div style="background: #fff8ed; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #78350f; font-size: 14px;">
              📚 Тема: <strong>${topicLabel || topicId || 'Загальна'}</strong><br/>
              ⚡ Складність: <strong>${diffLabels[difficulty] || difficulty}</strong><br/>
              ❓ Питань: <strong>${questionCount || 10}</strong>
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${challengeUrl}" style="display: inline-block; padding: 14px 32px; background: #d4973e; color: white; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: bold;">
              Прийняти виклик →
            </a>
          </div>
          <p style="margin-top: 24px; color: #9ca3af; font-size: 12px; text-align: center;">
            Виклик дійсний 48 годин. Якщо не хочете приймати — просто ігноруйте цей лист.
          </p>
        </div>
      `,
    }),
  })
  const emailResult = await emailRes.json()
  if (!emailRes.ok) {
    console.error('Resend error:', emailResult)
  } else {
    console.log('Email sent:', emailResult)
  }

  return NextResponse.json({ success: true, challengeId: challenge.id })
}
