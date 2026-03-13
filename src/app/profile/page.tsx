'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { DoveLogo } from '@/components/DoveLogo'
import { BIBLE_BOOKS, QUIZ_TOPICS } from '@/lib/bible-data'

const difficultyLabel: Record<string, string> = { easy: 'Легкий', medium: 'Середній', hard: 'Складний' }

const formatDate = (d: string) => new Date(d).toLocaleDateString('uk-UA', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
})

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setChecking(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('quiz_results').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([{ data: profileData }, { data: allResults }]) => {
      const results = allResults || []
      const computed = {
        total_quizzes: results.length,
        total_correct: results.reduce((s: number, r: any) => s + (r.correct_answers || 0), 0),
        total_questions: results.reduce((s: number, r: any) => s + (r.total_questions || 0), 0),
        best_score: results.length ? Math.max(...results.map((r: any) => r.score || 0)) : 0,
      }
      setProfile({ ...profileData, ...computed })
      setRecentResults(results.slice(0, 10))
    })
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id)

      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (checking) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-400 text-sm">Завантаження...</p>
      </div>
    </main>
  )

  const accuracy = profile?.total_questions > 0
    ? Math.round((profile.total_correct / profile.total_questions) * 100)
    : 0

  const initials = profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/quiz" className="flex items-center gap-2">
            <DoveLogo className="w-8 h-7 text-amber-600/70" />
            <span className="font-display text-xl font-bold">
              <span className="text-gold-shimmer">Bible</span>
              <span className="text-stone-900">Quiz</span>
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-stone-400 hover:text-stone-700 text-sm transition-colors"
          >
            Вийти
          </button>
        </div>

        {/* Profile card */}
        <div className="glass-card p-6 mb-6 stagger">
          <div className="flex items-center gap-4 mb-6">

            {/* Avatar with upload */}
            <div className="relative group flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-colors relative"
                title="Змінити фото"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Аватар"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-50 flex items-center justify-center font-display text-2xl font-bold text-amber-700">
                    {initials}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            <div>
              <h1 className="font-display text-xl font-bold text-stone-900">
                {profile?.display_name || 'Гравець'}
              </h1>
              <p className="text-stone-500 text-sm">{user?.email}</p>
              {profile?.created_at && (
                <p className="text-stone-400 text-xs mt-1">
                  З нами з {new Date(profile.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Тренувань', value: profile?.total_quizzes || 0, color: 'text-stone-900' },
              { label: 'Правильних', value: profile?.total_correct || 0, color: 'text-emerald-600' },
              { label: 'Кращий бал', value: `${profile?.best_score || 0}%`, color: 'text-amber-600' },
              { label: 'Точність', value: `${accuracy}%`, color: 'text-sacred-500' },
            ].map(s => (
              <div key={s.label} className="bg-amber-50/60 rounded-xl p-3 text-center border border-amber-100">
                <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-stone-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick action */}
        <Link href="/quiz" className="btn-gold block text-center py-3 rounded-xl text-sm mb-8">
          Нове тренування
        </Link>

        {/* Recent results */}
        <section>
          <h2 className="font-display text-xs tracking-widest uppercase text-amber-700 mb-4">
            Останні тренування
          </h2>
          {!recentResults.length ? (
            <div className="glass-card p-8 text-center text-stone-400">
              <p className="text-4xl mb-3">📖</p>
              <p>Ще не було тренувань. Почни прямо зараз!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map(r => (
                <div key={r.id} className="glass-card p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0 ${
                    r.score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    r.score >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {r.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-stone-800 text-sm font-medium truncate">
                      {r.mode === 'topic'
                        ? (QUIZ_TOPICS.find(t => t.id === r.topic_id)?.label ?? r.topic_id)
                        : (BIBLE_BOOKS.find(b => b.id === r.book_id)?.name ?? r.book_id)}
                    </div>
                    <div className="text-stone-400 text-xs mt-0.5">
                      {difficultyLabel[r.difficulty]} · {r.correct_answers}/{r.total_questions} правильно
                    </div>
                  </div>
                  <div className="text-stone-400 text-xs flex-shrink-0">
                    {formatDate(r.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
