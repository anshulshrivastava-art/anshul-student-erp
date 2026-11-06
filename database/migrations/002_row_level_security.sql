-- ==============================================================================
-- 002_ROW_LEVEL_SECURITY.SQL — RLS POLICIES FOR USER ISOLATION
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.subjects enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.day_overrides enable row level security;
alter table public.attendance_records enable row level security;
alter table public.semester_results enable row level security;
alter table public.exams enable row level security;
alter table public.assignments enable row level security;
alter table public.study_tasks enable row level security;
alter table public.notifications enable row level security;

-- Profiles: user owns row where id = auth.uid()
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Standard user_id policies
create policy "Users can read own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can manage own settings" on public.user_settings for all using (auth.uid() = user_id);

create policy "Users can manage own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Users can manage own timetable" on public.timetable_entries for all using (auth.uid() = user_id);
create policy "Users can manage own day overrides" on public.day_overrides for all using (auth.uid() = user_id);
create policy "Users can manage own attendance" on public.attendance_records for all using (auth.uid() = user_id);
create policy "Users can manage own semester results" on public.semester_results for all using (auth.uid() = user_id);
create policy "Users can manage own exams" on public.exams for all using (auth.uid() = user_id);
create policy "Users can manage own assignments" on public.assignments for all using (auth.uid() = user_id);
create policy "Users can manage own study tasks" on public.study_tasks for all using (auth.uid() = user_id);
create policy "Users can manage own notifications" on public.notifications for all using (auth.uid() = user_id);
