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

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
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

          <div className="cross-divider my-6 text-sm">або</div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Увійти через Google
          </button>

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
