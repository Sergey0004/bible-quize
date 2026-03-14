'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { BIBLE_BOOKS, QUIZ_TOPICS, DIFFICULTY_LABELS } from '@/lib/bible-data'
import { Difficulty } from '@/types'
import Link from 'next/link'
import { DoveLogo } from '@/components/DoveLogo'

type Mode = 'book' | 'topic'
type Tab = 'training' | 'duel'

export default function QuizPage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('training')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [mode, setMode] = useState<Mode>('topic')
  const [bookId, setBookId] = useState('')
  const [topicId, setTopicId] = useState('life-of-jesus')
  const [count, setCount] = useState(10)
  // Duel state
  const [duelEmail, setDuelEmail] = useState('')
  const [duelDifficulty, setDuelDifficulty] = useState<Difficulty>('medium')
  const [duelTopicId, setDuelTopicId] = useState('life-of-jesus')
  const [duelCount, setDuelCount] = useState(10)
  const [duelLoading, setDuelLoading] = useState(false)
  const [duelError, setDuelError] = useState('')
  const [duelSent, setDuelSent] = useState(false)
  const [duelChallengeId, setDuelChallengeId] = useState('')
  const [copied, setCopied] = useState(false)

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

  const handleDuelSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setDuelLoading(true)
    setDuelError('')
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { setDuelError('Необхідна авторизація'); setDuelLoading(false); return }
    const topic = QUIZ_TOPICS.find(t => t.id === duelTopicId)
    const res = await fetch('/api/challenge/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        challengedEmail: duelEmail,
        topicId: duelTopicId,
        topicLabel: topic?.label || duelTopicId,
        difficulty: duelDifficulty,
        questionCount: duelCount,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setDuelError(data.error || 'Помилка'); setDuelLoading(false); return }
    setDuelChallengeId(data.challengeId)
    setDuelSent(true)
    setDuelLoading(false)
  }

  const challengeLink = duelChallengeId
    ? `${window.location.origin}/challenge/${duelChallengeId}`
    : ''

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(challengeLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-stone-100 p-1 rounded-xl">
          {(['training', 'duel'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setDuelSent(false); setDuelError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-display tracking-wide transition-all ${
                tab === t ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t === 'training' ? '📖 Тренування' : '⚔️ Двобій'}
            </button>
          ))}
        </div>

        {tab === 'duel' && (
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Двобій</h1>
            <p className="text-stone-500 mb-8">Кинь виклик іншому гравцю по email</p>

            {duelSent ? (
              <div className="glass-card p-8 text-center animate-fade-up">
                <div className="text-4xl mb-4">⚔️</div>
                <h2 className="font-display text-xl text-amber-700 mb-2">Виклик створено!</h2>
                <p className="text-stone-500 text-sm mb-6">
                  Надішли це посилання суперникові через Telegram, WhatsApp або будь-який месенджер
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-left">
                  <p className="text-stone-600 text-xs break-all font-mono">{challengeLink}</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="btn-gold w-full py-3 rounded-xl text-sm mb-3"
                >
                  {copied ? '✓ Скопійовано!' : 'Скопіювати посилання'}
                </button>
                <button
                  onClick={() => { setDuelSent(false); setDuelEmail(''); setDuelChallengeId('') }}
                  className="w-full py-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all text-sm"
                >
                  Новий виклик
                </button>
              </div>
            ) : (
              <form onSubmit={handleDuelSend} className="space-y-6">
                <div className="glass-card p-6">
                  <label className="block text-sm text-stone-700 mb-2 font-display tracking-wide">
                    Email суперника
                  </label>
                  <input
                    type="email"
                    value={duelEmail}
                    onChange={e => setDuelEmail(e.target.value)}
                    className="input-sacred w-full px-4 py-3 text-sm"
                    placeholder="supernik@email.com"
                    required
                  />
                </div>

                <section>
                  <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
                    Тема питань
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {QUIZ_TOPICS.map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setDuelTopicId(t.id)}
                        className="glass-card px-4 py-3 text-left flex items-center gap-3 transition-all"
                        style={duelTopicId === t.id ? { borderColor: 'rgba(212,151,62,0.60)', backgroundColor: 'rgba(212,151,62,0.08)' } : {}}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span className={`text-sm ${duelTopicId === t.id ? 'text-amber-700 font-medium' : 'text-stone-600'}`}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
                    Складність
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => {
                      const info = DIFFICULTY_LABELS[d]
                      const active = duelDifficulty === d
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setDuelDifficulty(d)}
                          className="glass-card p-4 text-left transition-all"
                          style={active ? { borderColor: 'rgba(212,151,62,0.60)', backgroundColor: 'rgba(212,151,62,0.08)' } : {}}
                        >
                          <div className={`font-display text-sm font-semibold mb-1 ${active ? 'text-amber-700' : 'text-stone-700'}`}>
                            {info.label}
                          </div>
                          <div className="text-xs text-stone-400">{info.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
                    Кількість питань
                  </h2>
                  <div className="flex gap-3">
                    {[5, 10, 15, 20].map(n => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setDuelCount(n)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-display transition-all ${
                          duelCount === n
                            ? 'border-amber-400/60 bg-amber-50 text-amber-700 font-semibold'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </section>

                {duelError && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {duelError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={duelLoading}
                  className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-40"
                >
                  {duelLoading ? 'Надсилаємо...' : '⚔️ Кинути виклик'}
                </button>
              </form>
            )}
          </div>
        )}

        {tab === 'training' && (
          <div>
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
        )}
      </div>
    </main>
  )
}
