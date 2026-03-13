-- =============================================
-- BIBLE QUIZ — Database Schema (Supabase SQL)
-- Запустіть цей файл у Supabase SQL Editor
-- =============================================

-- Профілі користувачів (розширення auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT 'Гравець',
  avatar_url TEXT,
  total_quizzes INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  best_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Автоматично створювати профіль при реєстрації
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Гравець'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Результати тренувань
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mode TEXT NOT NULL CHECK (mode IN ('book', 'topic')),
  book_id TEXT,
  topic_id TEXT,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  score INT NOT NULL, -- 0-100
  time_spent INT NOT NULL, -- seconds
  questions JSONB NOT NULL, -- збережені питання
  answers JSONB NOT NULL,   -- відповіді користувача
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Оновлювати статистику профілю після кожного квізу
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    total_quizzes = total_quizzes + 1,
    total_correct = total_correct + NEW.correct_answers,
    best_score = GREATEST(best_score, NEW.score)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quiz_completed
  AFTER INSERT ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Користувач бачить лише свій профіль (читає) + публічні профілі (для лідерборду)
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Квіз-результати: лише свої
CREATE POLICY "quiz_results_read_own" ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_results_insert_own" ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at DESC);
