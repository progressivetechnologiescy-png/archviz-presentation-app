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
    thumbnail_url text,
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
    initial_camera jsonb, -- e.g. {"position": [0,0,0], "rotation": [0,0,0]}
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create properties config table (for GPS, Title, and dynamic presentation overrides)
create table if not exists properties_config (
    project_id text primary key,
    title text not null,
    company_name text default 'ARCHVIZ STUDIO LTD.',
    project_description text default 'Welcome to the ultimate expression of modern architectural design. Nestled in the prestigious hills, this property features breathtaking panoramic views, seamless indoor-outdoor living, and state-of-the-art cinematic finishes.',
    logo_url text,
    overview_media_type text default 'images',
    overview_video_url text,
    gps_coordinates text,
    lighting_preset text default 'noon',
    active_material text default 'marble',
    inventory_data jsonb default '[]'::jsonb,
    gemini_api_key text,
    ai_context text,
    accent_color text default '#3b82f6',
    theme_mode text default 'dark'
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

-- 2.8 Create the Cinematic Videos table
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

create policy "Allow anonymous inserts on config"
  on properties_config for insert
  with check (true);

create policy "Allow anonymous updates on config"
  on properties_config for update
  using (true);
-- Setup script for the ArchViz CMS Database Expansion

-- 1. Categorized Render Folders
CREATE TABLE IF NOT EXISTS project_renders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text NOT NULL,
  folder_name text NOT NULL DEFAULT 'Uncategorized',
  image_url text NOT NULL,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Multi-Floorplan Management
CREATE TABLE IF NOT EXISTS project_floorplans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text NOT NULL,
  label text NOT NULL DEFAULT 'Floorplan',
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 360 Tour Hotspot Builder
CREATE TABLE IF NOT EXISTS project_panoramas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text NOT NULL,
  room_name text NOT NULL,
  panorama_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS panorama_hotspots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_panorama_id uuid REFERENCES project_panoramas(id) ON DELETE CASCADE,
  target_panorama_id uuid REFERENCES project_panoramas(id) ON DELETE CASCADE,
  pitch numeric NOT NULL, -- Y axis angle
  yaw numeric NOT NULL,   -- X axis angle
  label text
);

-- 4. Real-Time Availability & Pricing
CREATE TABLE IF NOT EXISTS project_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text NOT NULL,
  unit_number text NOT NULL,
  beds integer DEFAULT 0,
  baths numeric DEFAULT 0,
  sqft integer DEFAULT 0,
  price numeric DEFAULT 0,
  status text DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS Policies (Allow all for rapid prototyping)
ALTER TABLE project_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_floorplans ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_panoramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE panorama_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read renders" ON project_renders FOR SELECT USING (true);
CREATE POLICY "Allow public all renders" ON project_renders FOR ALL USING (true);

CREATE POLICY "Allow public read floorplans" ON project_floorplans FOR SELECT USING (true);
CREATE POLICY "Allow public all floorplans" ON project_floorplans FOR ALL USING (true);

CREATE POLICY "Allow public read panoramas" ON project_panoramas FOR SELECT USING (true);
CREATE POLICY "Allow public all panoramas" ON project_panoramas FOR ALL USING (true);

CREATE POLICY "Allow public read hotspots" ON panorama_hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public all hotspots" ON panorama_hotspots FOR ALL USING (true);

CREATE POLICY "Allow public read availability" ON project_availability FOR SELECT USING (true);
CREATE POLICY "Allow public all availability" ON project_availability FOR ALL USING (true);
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
alter table project_tours add column if not exists initial_camera jsonb;
-- Fix for renders not deleting
create policy "Allow anonymous deletes on renders"
  on project_renders for delete
  using (true);
