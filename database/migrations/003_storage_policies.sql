-- ==============================================================================
-- 003_STORAGE_POLICIES.SQL — SUPABASE STORAGE FOR PROFILE PHOTOS
-- ==============================================================================

insert into storage.buckets (id, name, public) 
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload avatar to own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can update avatar in own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Anyone can read avatars"
on storage.objects for select
using (bucket_id = 'profile-photos');
