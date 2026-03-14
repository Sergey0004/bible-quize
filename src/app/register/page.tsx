'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DoveLogo } from '@/components/DoveLogo'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setError('Цей email вже зареєстрований. Спробуйте увійти.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }
    // If identities array is empty, the email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Цей email вже зареєстрований. Спробуйте увійти.')
      setLoading(false)
      return
    }
    if (data.session) {
      router.push('/quiz')
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 text-center max-w-md animate-fade-up">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="font-display text-2xl text-amber-700 mb-3">Перевірте email</h2>
        <p className="text-stone-600">
          Ми надіслали підтвердження на <strong className="text-stone-900">{email}</strong>.
          Перейдіть за посиланням щоб активувати акаунт.
        </p>
        <Link href="/login" className="mt-6 inline-block text-amber-600 hover:text-amber-700 text-sm font-medium">
          Повернутись до входу →
        </Link>
      </div>
    </main>
  )

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
          <p className="text-stone-500 mt-2">Створіть акаунт — це безкоштовно</p>
        </div>

        <div className="glass-card p-8 stagger">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm text-stone-700 mb-2 font-display tracking-wide">
                Ваше ім&apos;я
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-sacred w-full px-4 py-3 text-sm"
                placeholder="Іван Петренко"
                required
              />
            </div>
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
                placeholder="Мін. 8 символів"
                minLength={8}
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
              className="btn-gold w-full py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? 'Реєструємо...' : 'Зареєструватись'}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Вже є акаунт?{' '}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
