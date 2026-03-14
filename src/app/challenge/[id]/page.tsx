'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DoveLogo } from '@/components/DoveLogo'
import Link from 'next/link'
import { QUIZ_TOPICS } from '@/lib/bible-data'

const diffLabels: Record<string, string> = { easy: 'Легкий', medium: 'Середній', hard: 'Складний' }

export default function ChallengePage() {
  const router = useRouter()
  const params = useParams()
  const challengeId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [challenge, setChallenge] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
  }, [])

  useEffect(() => {
    if (!challengeId) return
    supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Виклик не знайдено або він вже недійсний')
        } else {
          setChallenge(data)
        }
        setLoading(false)
      })
  }, [challengeId])

  const handleRespond = async (action: 'accept' | 'decline') => {
    if (!user) {
      router.push(`/login?returnTo=/challenge/${challengeId}`)
      return
    }
    setResponding(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { setError('Необхідна авторизація'); setResponding(false); return }

    const res = await fetch('/api/challenge/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ challengeId, action }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Помилка')
      setResponding(false)
      return
    }

    if (action === 'accept') {
      const params = new URLSearchParams({
        difficulty: challenge.difficulty,
        mode: 'topic',
        count: String(challenge.question_count),
        ...(challenge.topic_id ? { topicId: challenge.topic_id } : {}),
        challengeId,
      })
      router.push(`/quiz/play?${params}`)
    } else {
      router.push('/quiz')
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
    </main>
  )

  if (error) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-stone-600 mb-6">{error}</p>
        <Link href="/quiz" className="btn-gold px-6 py-3 rounded-xl text-sm">На головну</Link>
      </div>
    </main>
  )

  const topicLabel = QUIZ_TOPICS.find(t => t.id === challenge.topic_id)?.label || challenge.topic_id || 'Загальна'
  const isExpired = new Date(challenge.expires_at) < new Date()
  const isMyChallenge = user?.id === challenge.challenged_id
  const alreadyResponded = challenge.status !== 'pending'

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <DoveLogo className="w-14 h-12 text-amber-600/80 mb-1" />
            <span className="font-display text-3xl font-bold">
              <span className="text-gold-shimmer">Bible</span>
              <span className="text-stone-900">Quiz</span>
            </span>
          </Link>
        </div>

        <div className="glass-card p-8 text-center animate-fade-up">
          <div className="text-4xl mb-4">⚔️</div>
          <h1 className="font-display text-2xl text-stone-900 mb-2">Виклик!</h1>
          <p className="text-stone-500 mb-6">
            <strong className="text-stone-800">{challenge.challenger_name}</strong> кидає вам виклик
          </p>

          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Тема</span>
              <span className="font-medium text-stone-800">{topicLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Складність</span>
              <span className="font-medium text-stone-800">{diffLabels[challenge.difficulty]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Питань</span>
              <span className="font-medium text-stone-800">{challenge.question_count}</span>
            </div>
          </div>

          {!user && (
            <div className="space-y-3">
              <p className="text-stone-500 text-sm mb-4">Увійдіть щоб прийняти виклик</p>
              <Link
                href={`/login?returnTo=/challenge/${challengeId}`}
                className="btn-gold block py-3 rounded-xl text-sm"
              >
                Увійти та прийняти
              </Link>
              <Link
                href={`/register?returnTo=/challenge/${challengeId}`}
                className="block py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all text-sm"
              >
                Зареєструватись
              </Link>
            </div>
          )}

          {user && !isMyChallenge && (
            <p className="text-stone-400 text-sm">Цей виклик адресований іншому користувачу</p>
          )}

          {user && isMyChallenge && isExpired && (
            <p className="text-red-500 text-sm">Термін дії виклику минув</p>
          )}

          {user && isMyChallenge && alreadyResponded && !isExpired && (
            <p className="text-stone-500 text-sm">
              Ви вже {challenge.status === 'accepted' ? 'прийняли' : 'відхилили'} цей виклик
            </p>
          )}

          {user && isMyChallenge && !alreadyResponded && !isExpired && (
            <div className="flex gap-3">
              <button
                onClick={() => handleRespond('decline')}
                disabled={responding}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all text-sm disabled:opacity-50"
              >
                Відхилити
              </button>
              <button
                onClick={() => handleRespond('accept')}
                disabled={responding}
                className="flex-1 btn-gold py-3 rounded-xl text-sm disabled:opacity-50"
              >
                {responding ? 'Генеруємо питання...' : 'Прийняти ⚔️'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
