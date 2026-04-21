-- 1. Create the Cloud Storage Bucket for massive .FBX and .GLB architectures
insert into storage.buckets (id, name, public)
values ('archviz_models', 'archviz_models', true)
on conflict (id) do nothing;

-- 2. Create the presentation assets table
create table if not exists presentation_assets (
    id uuid default gen_random_uuid() primary key,
    project_id text not null, -- e.g., "pinnacle_residence"
    asset_type text not null, -- 'render', 'fbx', 'panorama', 'floorplan'
    asset_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create properties config table (for GPS, Title, and dynamic Lead Scraper overrides)
create table if not exists properties_config (
    project_id text primary key,
    title text not null,
    gps_coordinates text,
    lighting_preset text default 'noon',
    active_material text default 'marble'
);

-- 4. Enable Row Level Security (RLS) but allow public reads for the presentation app
alter table presentation_assets enable row level security;
alter table properties_config enable row level security;

create policy "Allow public read access on asserts"
  on presentation_assets for select
  using (true);

create policy "Allow public read access on config"
  on properties_config for select
  using (true);

-- (To allow Admin Uploads via the web app without complex Auth for this MVP, you can temporarily allow anonymous inserts, or strictly manage uploads via the Supabase Dashboard UI!)
