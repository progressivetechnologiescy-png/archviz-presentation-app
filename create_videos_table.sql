-- Run this in your Supabase SQL Editor to create the Cinematic Videos table

create table if not exists project_videos (
    id uuid default gen_random_uuid() primary key,
    project_id text not null,
    title text not null,
    video_url text not null,
    thumbnail_url text,
    order_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table project_videos enable row level security;

create policy "Allow public read access on videos"
  on project_videos for select
  using (true);

create policy "Allow anonymous inserts on videos"
  on project_videos for insert
  with check (true);

create policy "Allow anonymous updates on videos"
  on project_videos for update
  using (true);

create policy "Allow anonymous deletes on videos"
  on project_videos for delete
  using (true);
