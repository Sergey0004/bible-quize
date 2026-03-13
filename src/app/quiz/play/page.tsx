'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Question, QuizSettings } from '@/types'
import { BIBLE_BOOKS, QUIZ_TOPICS } from '@/lib/bible-data'
import { createClient } from '@/lib/supabase'
import { DoveLogo } from '@/components/DoveLogo'

type Phase = 'loading' | 'playing' | 'review' | 'done'

const LETTERS = ['А', 'Б', 'В', 'Г']

function QuizPlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const settings: QuizSettings = {
    difficulty: (searchParams.get('difficulty') as any) || 'medium',
    mode: (searchParams.get('mode') as any) || 'topic',
    bookId: searchParams.get('bookId') || undefined,
    topicId: searchParams.get('topicId') || undefined,
    questionCount: parseInt(searchParams.get('count') || '10'),
  }

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [startTime] = useState(Date.now())
  const [error, setError] = useState('')
  const saving = useRef(false)

  // Load questions
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { setError('Необхідна авторизація'); return }

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          difficulty: settings.difficulty,
          mode: settings.mode,
          bookId: settings.bookId,
          topicId: settings.topicId,
          count: settings.questionCount,
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(null))
      setPhase('playing')
    }
    load()
  }, [])

  const current = questions[currentIdx]

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const newAnswers = [...answers]
    newAnswers[currentIdx] = idx
    setAnswers(newAnswers)
  }

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      setPhase('done')
      saveResult()
    }
  }, [currentIdx, questions.length, answers])

  const saveResult = async () => {
    if (saving.current) return
    saving.current = true
    const correctAnswers = answers.filter((a, i) => a === questions[i]?.correctIndex).length
    const score = Math.round((correctAnswers / questions.length) * 100)
    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    await fetch('/api/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        ...settings,
        totalQuestions: questions.length,
        correctAnswers,
        score,
        timeSpent,
        questions,
        answers,
      }),
    })
  }

  const correctCount = answers.filter((a, i) => a !== null && a === questions[i]?.correctIndex).length
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const timeSpent = Math.round((Date.now() - startTime) / 1000)

  const contextLabel = settings.mode === 'book'
    ? BIBLE_BOOKS.find(b => b.id === settings.bookId)?.name
    : QUIZ_TOPICS.find(t => t.id === settings.topicId)?.label

  // Loading state
  if (phase === 'loading') return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center stagger">
        <div className="relative mb-8 flex justify-center">
          <div className="w-20 h-20 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <DoveLogo className="w-10 h-9 text-amber-500/60" />
          </div>
        </div>
        <h2 className="font-display text-xl text-stone-800 mb-2">Генеруємо питання...</h2>
        <p className="text-stone-400 text-sm">AI готує унікальні питання для вас</p>
        {error && <p className="text-red-600 mt-4 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</p>}
      </div>
    </main>
  )

  // Results screen
  if (phase === 'done') return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8 stagger">
          {/* Score circle */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8"/>
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke={score >= 70 ? '#16a34a' : score >= 40 ? '#d4973e' : '#dc2626'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 44 * score / 100} 999`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold text-stone-900">{score}</span>
              <span className="text-stone-400 text-xs">балів</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">
            {score >= 80 ? 'Чудово! 🎉' : score >= 60 ? 'Добре! 👍' : score >= 40 ? 'Непогано 📖' : 'Продовжуй вчитись 🙏'}
          </h1>
          <p className="text-stone-500">
            {correctCount} з {questions.length} правильно · {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')} хв
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Правильно', value: correctCount, color: 'text-emerald-600' },
            { label: 'Неправильно', value: questions.length - correctCount, color: 'text-red-500' },
            { label: 'Час', value: `${Math.floor(timeSpent / 60)}:${String(timeSpent % 60).padStart(2, '0')}`, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-stone-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Review answers */}
        <div className="mb-8">
          <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">Перегляд відповідей</h2>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const userAns = answers[i]
              const correct = userAns === q.correctIndex
              return (
                <div key={q.id} className={`glass-card p-4 border ${correct ? 'border-emerald-300/60' : 'border-red-300/50'}`}>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs">{correct ? '✅' : '❌'}</span>
                    <p className="text-sm text-stone-700 flex-1">{q.text}</p>
                  </div>
                  <p className="text-xs text-emerald-600 mb-1">
                    ✓ {q.options[q.correctIndex]}
                  </p>
                  {!correct && userAns !== null && (
                    <p className="text-xs text-red-500 mb-1">
                      Ваша відповідь: {q.options[userAns]}
                    </p>
                  )}
                  <p className="text-xs text-stone-400 italic mt-2">{q.explanation}</p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">{q.reference}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/quiz')}
            className="flex-1 btn-gold py-3 rounded-xl text-sm"
          >
            Нове тренування
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all text-sm"
          >
            Мій профіль
          </button>
        </div>
      </div>
    </main>
  )

  // Playing state
  if (!current) return null
  const progress = (currentIdx / questions.length) * 100

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/quiz')} className="text-stone-400 hover:text-stone-700 text-sm transition-colors">
            ← Вийти
          </button>
          <div className="text-center">
            <div className="text-xs text-stone-400 font-display tracking-widest uppercase">{contextLabel}</div>
          </div>
          <div className="text-sm text-stone-500 font-display">
            {currentIdx + 1}<span className="text-stone-300">/{questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track h-1.5 mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="mb-8 animate-fade-up" key={currentIdx}>
          <div className="text-xs text-amber-600 font-display tracking-widest uppercase mb-3">
            Питання {currentIdx + 1}
          </div>
          <h2 className="text-xl md:text-2xl text-stone-900 leading-relaxed font-body">
            {current.text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {current.options.map((option, i) => {
            let cls = 'answer-option'
            if (revealed) {
              cls += ' disabled'
              if (i === current.correctIndex) cls += ' correct'
              else if (i === selected) cls += ' wrong'
            } else if (i === selected) {
              cls += ' selected'
            }

            return (
              <button
                key={i}
                className={`${cls} w-full text-left px-5 py-4 flex items-center gap-4`}
                onClick={() => handleSelect(i)}
              >
                <span className={`font-display text-sm font-bold w-6 flex-shrink-0 ${
                  revealed && i === current.correctIndex ? 'text-emerald-600' :
                  revealed && i === selected ? 'text-red-500' : 'text-stone-400'
                }`}>
                  {LETTERS[i]}
                </span>
                <span className="text-stone-700 text-sm leading-snug">{option}</span>
                {revealed && i === current.correctIndex && (
                  <span className="ml-auto text-emerald-600">✓</span>
                )}
                {revealed && i === selected && i !== current.correctIndex && (
                  <span className="ml-auto text-red-500">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation + Next */}
        {revealed && (
          <div className="animate-fade-up">
            <div className="glass-card p-4 mb-4 border-amber-300/40 bg-amber-50/40">
              <p className="text-sm text-stone-600 italic mb-1">{current.explanation}</p>
              <p className="text-xs text-amber-700 font-display font-medium">{current.reference}</p>
            </div>
            <button onClick={handleNext} className="btn-gold w-full py-3 rounded-xl text-sm">
              {currentIdx < questions.length - 1 ? 'Наступне питання →' : 'Завершити тренування'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function QuizPlayPage() {
  return (
    <Suspense>
      <QuizPlayContent />
    </Suspense>
  )
}
