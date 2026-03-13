import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DoveLogo } from '@/components/DoveLogo'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/quiz')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-300/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-sacred-200/20 blur-[80px]" />
        <div className="absolute top-1/2 left-0 w-60 h-60 rounded-full bg-amber-200/15 blur-[70px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto stagger">
        {/* Dove logo */}
        <div className="flex justify-center mb-8">
          <div className="relative animate-pulse-glow">
            <DoveLogo className="w-24 h-20 text-amber-600/80" />
            <div className="absolute inset-0 bg-amber-400/15 blur-2xl rounded-full -z-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
          <span className="text-gold-shimmer">Bible</span>
          <span className="text-stone-900">Quiz</span>
        </h1>

        <div className="cross-divider my-6">
          <span className="font-display text-sm tracking-widest uppercase text-amber-700/70">
            Пізнай Слово Боже
          </span>
        </div>

        <p className="text-stone-600 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Тренуйся, змагайся з іншими і поглиблюй знання Святого Письма.
          Кожне питання — крок до мудрості.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="btn-gold px-8 py-4 rounded-xl text-lg inline-block text-center"
          >
            Почати безкоштовно
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl text-lg border border-stone-300 text-stone-600 hover:border-amber-400/70 hover:text-stone-900 hover:bg-amber-50/60 transition-all text-center"
          >
            Увійти
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
          {[
            { icon: '🤖', title: 'AI-питання', desc: 'Унікальні питання, згенеровані штучним інтелектом' },
            { icon: '📚', title: '66 книг', desc: 'Від Буття до Одкровення — весь канон' },
            { icon: '🏆', title: 'Тренування', desc: 'Різні рівні складності та тематики' },
          ].map(f => (
            <div key={f.title} className="glass-card p-5 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-display text-sm font-semibold text-amber-700 mb-2 tracking-wide">
                {f.title}
              </div>
              <p className="text-stone-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
