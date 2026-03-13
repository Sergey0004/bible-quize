# BibleQuiz 📖

Платформа для тренувань та змагань зі знань Біблії з AI-генерованими питаннями.

## Стек технологій

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Claude API (Anthropic) — генерація питань
- **Деплой**: Vercel

---

## Швидкий старт

### 1. Клонуйте та встановіть залежності

```bash
git clone <your-repo>
cd bible-quiz
npm install
```

### 2. Налаштуйте Supabase

1. Створіть i проєкт на [supabase.com](https://supabase.com)
2. Відкрийте **SQL Editor** і запустіть файл `supabase-schema.sql`
3. В **Authentication → Providers** увімкніть Google OAuth (опційно)
4. Скопіюйте `Project URL` та `anon key` з **Settings → API**

### 3. Отримайте Claude API Key

1. Зареєструйтесь на [console.anthropic.com](https://console.anthropic.com)
2. Створіть API key

### 4. Налаштуйте змінні середовища

```bash
cp .env.local.example .env.local
```

Заповніть `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Запустіть

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

---

## Деплой на Vercel

```bash
npm install -g vercel
vercel
```

Додайте всі змінні з `.env.local` у Vercel dashboard → Settings → Environment Variables.

Після деплою оновіть `NEXT_PUBLIC_APP_URL` на ваш домен, і в Supabase Authentication → URL Configuration додайте:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/auth/callback`

---

## Структура проєкту

```
src/
├── app/
│   ├── page.tsx              # Лендінг
│   ├── login/page.tsx        # Вхід
│   ├── register/page.tsx     # Реєстрація
│   ├── quiz/
│   │   ├── page.tsx          # Вибір параметрів квізу
│   │   └── play/page.tsx     # Сам квіз
│   ├── profile/page.tsx      # Профіль і статистика
│   └── api/
│       ├── generate-questions/route.ts  # AI генерація питань
│       └── save-result/route.ts         # Збереження результату
├── lib/
│   ├── supabase.ts           # Supabase client (browser)
│   ├── supabase-server.ts    # Supabase client (server)
│   └── bible-data.ts         # Книги Біблії + теми
├── types/index.ts            # TypeScript типи
└── middleware.ts             # Auth захист роутів
```

---

## Фази розробки

- ✅ **Фаза 1** — MVP: реєстрація, тренування з AI-питаннями, результати
- 🔲 **Фаза 2** — Адмін-панель
- 🔲 **Фаза 3** — Платежі (Stripe)
- 🔲 **Фаза 4** — Онлайн-змагання в реальному часі
- 🔲 **Фаза 5** — PWA, гейміфікація, зростання
