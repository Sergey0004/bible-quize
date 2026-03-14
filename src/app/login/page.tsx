'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { DoveLogo } from '@/components/DoveLogo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/quiz')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 stagger">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <DoveLogo className="w-14 h-12 text-amber-600/80 mb-1" />
            <span className="font-display text-3xl font-bold">
              <span className="text-gold-shimmer">Bible</span>
              <span className="text-stone-900">Quiz</span>
            </span>
          </Link>
          <p className="text-stone-500 mt-2">Вхід до вашого акаунту</p>
        </div>

        <div className="glass-card p-8 stagger">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-stone-700 mb-2 font-display tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-sacred w-full px-4 py-3 text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-stone-700 mb-2 font-display tracking-wide">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-sacred w-full px-4 py-3 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Входимо...' : 'Увійти'}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Немає акаунту?{' '}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
