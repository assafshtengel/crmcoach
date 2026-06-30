
-- Enable RLS on the 5 exposed tables and add minimal safe policies

-- 1) users (single id column, RLS off, no policies)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own row"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 2) pre_lecture_surveys (RLS off, no policies)
ALTER TABLE public.pre_lecture_surveys ENABLE ROW LEVEL SECURITY;
-- No SELECT policy = no read access for anon/authenticated. Service role still works for admin.
-- (If app needs reads, add policy later once we know the owner column.)

-- 3) shopping_lists (RLS off, policies already exist - just enable)
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- 4) shopping_items (RLS off, policies already exist - just enable)
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- 5) shopping_history (RLS off, policies already exist - just enable)
ALTER TABLE public.shopping_history ENABLE ROW LEVEL SECURITY;
