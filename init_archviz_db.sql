-- 1. Create the Cloud Storage Bucket for massive .FBX and .GLB architectures
insert into storage.buckets (id, name, public)
values ('archviz_models', 'archviz_models', true)
on conflict (id) do nothing;

-- 2. Create the presentation assets table (Legacy/Core Models)
create table if not exists presentation_assets (
    id uuid default gen_random_uuid() primary key,
    project_id text not null, -- e.g., "demo_project"
    asset_type text not null, -- 'fbx', 'panorama', 'floorplan'
    asset_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.5 Create the Render Gallery table (Supports Folders and Slideshow toggles)
create table if not exists project_renders (
    id uuid default gen_random_uuid() primary key,
    project_id text not null,
    folder_name text not null,
    image_url text not null,
    is_overview boolean default false,
    overview_order integer default 0,
    folder_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.6 Create the Multi-Layer Floorplans table
create table if not exists project_floorplans (
    id uuid default gen_random_uuid() primary key,
    project_id text not null,
    property_type text default 'Default Property',
    level_name text not null, -- e.g., "Ground Floor"
    image_url text not null,
    order_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.7 Create the Spatial Tours table (Nodes and Hotspots)
create table if not exists project_tours (
    id uuid default gen_random_uuid() primary key,
    project_id text not null,
    node_name text not null, -- e.g., "Living Room"
    image_url text not null,
    hotspots jsonb default '[]'::jsonb,
    is_starting_node boolean default false,
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

alter table presentation_assets enable row level security;
alter table properties_config enable row level security;
alter table project_renders enable row level security;

create policy "Allow public read access on asserts"
  on presentation_assets for select
  using (true);

create policy "Allow public read access on config"
  on properties_config for select
  using (true);

create policy "Allow public read access on renders"
  on project_renders for select
  using (true);

create policy "Allow public read access on floorplans"
  on project_floorplans for select
  using (true);

create policy "Allow public read access on tours"
  on project_tours for select
  using (true);

-- (To allow Admin Uploads via the web app without complex Auth for this MVP, you can temporarily allow anonymous inserts/updates, or strictly manage uploads via the Supabase Dashboard UI!)
create policy "Allow anonymous inserts on renders"
  on project_renders for insert
  with check (true);

create policy "Allow anonymous updates on renders"
  on project_renders for update
  using (true);

create policy "Allow anonymous inserts on floorplans"
  on project_floorplans for insert
  with check (true);

create policy "Allow anonymous updates on floorplans"
  on project_floorplans for update
  using (true);

create policy "Allow anonymous deletes on floorplans"
  on project_floorplans for delete
  using (true);

create policy "Allow anonymous inserts on tours"
  on project_tours for insert
  with check (true);

create policy "Allow anonymous updates on tours"
  on project_tours for update
  using (true);

create policy "Allow anonymous deletes on tours"
  on project_tours for delete
  using (true);
