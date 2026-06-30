
DROP FUNCTION IF EXISTS public.exec_sql(text);

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
    WHERE n.nspname='public' AND p.prosecdef=true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;
CREATE POLICY "Authenticated can insert bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can create families" ON public.families;
DROP POLICY IF EXISTS "Anyone can update families" ON public.families;
CREATE POLICY "Authenticated can create families" ON public.families FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update families" ON public.families FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated users to join families" ON public.family_members;
CREATE POLICY "Users can join families as themselves" ON public.family_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players can insert their own milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Players can delete their own milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Players can update their own milestones" ON public.goal_milestones;
CREATE POLICY "Authenticated insert milestones" ON public.goal_milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update milestones" ON public.goal_milestones FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete milestones" ON public.goal_milestones FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.mental_prep_forms;
CREATE POLICY "Players/coaches insert mental prep" ON public.mental_prep_forms FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id OR auth.uid() = coach_id);

DROP POLICY IF EXISTS "Allow inserting notifications" ON public.notifications;
CREATE POLICY "Coach inserts notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.notifications_log;
CREATE POLICY "Coach inserts notifications log" ON public.notifications_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Anyone can create shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Anyone can update shopping lists" ON public.shopping_lists;
CREATE POLICY "Users create own shopping lists" ON public.shopping_lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own shopping lists" ON public.shopping_lists FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can create shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Anyone can update shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Anyone can delete shopping items" ON public.shopping_items;
CREATE POLICY "Authenticated create shopping items" ON public.shopping_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update shopping items" ON public.shopping_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete shopping items" ON public.shopping_items FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can create shopping history" ON public.shopping_history;
CREATE POLICY "Users create own shopping history" ON public.shopping_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players can insert their own training summaries" ON public.training_summaries;
DROP POLICY IF EXISTS "Players can update their own training summaries" ON public.training_summaries;
DROP POLICY IF EXISTS "Players can delete their own training summaries" ON public.training_summaries;
CREATE POLICY "Players insert own training summaries" ON public.training_summaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Players update own training summaries" ON public.training_summaries FOR UPDATE TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "Players delete own training summaries" ON public.training_summaries FOR DELETE TO authenticated USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Anyone can create family links" ON public.user_family_links;
CREATE POLICY "Authenticated create family links" ON public.user_family_links FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Coaches can create their own videos" ON public.videos;
CREATE POLICY "Coaches create their own videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Allow all operations on imbody for now" ON public.imbody;
CREATE POLICY "Authenticated manage imbody" ON public.imbody FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow all operations on imbody_telaviv" ON public.imbody_telaviv;
CREATE POLICY "Authenticated manage imbody_telaviv" ON public.imbody_telaviv FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service can manage all roles" ON public.user_roles;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_player_video_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_player_video_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coach_statistics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_sessions_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_reminders_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_session_distribution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_family(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_family_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_family(text) TO authenticated;
