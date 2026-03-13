'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { BIBLE_BOOKS, QUIZ_TOPICS, DIFFICULTY_LABELS } from '@/lib/bible-data'
import { Difficulty } from '@/types'
import Link from 'next/link'
import { DoveLogo } from '@/components/DoveLogo'

type Mode = 'book' | 'topic'

export default function QuizPage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [mode, setMode] = useState<Mode>('topic')
  const [bookId, setBookId] = useState('')
  const [topicId, setTopicId] = useState('life-of-jesus')
  const [count, setCount] = useState(10)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setChecking(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-400 text-sm">Завантаження...</p>
      </div>
    </main>
  )

  const oldBooks = BIBLE_BOOKS.filter(b => b.testament === 'old')
  const newBooks = BIBLE_BOOKS.filter(b => b.testament === 'new')

  const handleStart = () => {
    const params = new URLSearchParams({
      difficulty,
      mode,
      count: count.toString(),
      ...(mode === 'book' && bookId ? { bookId } : {}),
      ...(mode === 'topic' && topicId ? { topicId } : {}),
    })
    router.push(`/quiz/play?${params}`)
  }

  const canStart = mode === 'topic' ? !!topicId : !!bookId

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <Link href="/quiz" className="flex items-center gap-2">
            <DoveLogo className="w-8 h-7 text-amber-600/70" />
            <span className="font-display text-xl font-bold">
              <span className="text-gold-shimmer">Bible</span>
              <span className="text-stone-900">Quiz</span>
            </span>
          </Link>
          <Link href="/profile" className="text-stone-500 hover:text-stone-800 text-sm transition-colors">
            Профіль →
          </Link>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-2">
          Нове тренування
        </h1>
        <p className="text-stone-500 mb-8">Налаштуй параметри та починай</p>

        <section className="mb-8">
          <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
            1. Рівень складності
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => {
              const info = DIFFICULTY_LABELS[d]
              const active = difficulty === d
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="glass-card p-4 text-left transition-all"
                  style={active ? { borderColor: 'rgba(212,151,62,0.60)', backgroundColor: 'rgba(212,151,62,0.08)', boxShadow: '0 2px 16px rgba(212,151,62,0.15)' } : {}}
                >
                  <div className={`font-display text-sm font-semibold mb-1 ${active ? 'text-amber-700' : 'text-stone-700'}`}>
                    {info.label}
                  </div>
                  <div className="text-xs text-stone-400 leading-tight">{info.description}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
            2. Обери тип питань
          </h2>
          <div className="flex gap-3 mb-5">
            {(['topic', 'book'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl border text-sm font-display tracking-wide transition-all ${
                  mode === m
                    ? 'border-amber-400/60 bg-amber-50 text-amber-700'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {m === 'topic' ? '📚 За темою' : '📖 За книгою'}
              </button>
            ))}
          </div>

          {mode === 'topic' && (
            <div className="grid grid-cols-2 gap-2">
              {QUIZ_TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTopicId(t.id)}
                  className="glass-card px-4 py-3 text-left flex items-center gap-3 transition-all"
                  style={topicId === t.id ? { borderColor: 'rgba(212,151,62,0.60)', backgroundColor: 'rgba(212,151,62,0.08)' } : {}}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className={`text-sm ${topicId === t.id ? 'text-amber-700 font-medium' : 'text-stone-600'}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {mode === 'book' && (
            <div className="space-y-4">
              {[{ label: 'Старий Заповіт', books: oldBooks }, { label: 'Новий Заповіт', books: newBooks }].map(group => (
                <div key={group.label}>
                  <div className="text-xs text-stone-400 uppercase tracking-widest mb-2 px-1">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.books.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setBookId(b.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          bookId === b.id
                            ? 'border-amber-400/70 bg-amber-50 text-amber-700 font-medium'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
            3. Кількість питань
          </h2>
          <div className="flex gap-3">
            {[5, 10, 15, 20].map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl border text-sm font-display transition-all ${
                  count === n
                    ? 'border-amber-400/60 bg-amber-50 text-amber-700 font-semibold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Розпочати тренування
        </button>
      </div>
    </main>
  )
}
