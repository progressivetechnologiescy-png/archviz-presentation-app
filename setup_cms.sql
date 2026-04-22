-- Setup script for the ArchViz CMS Database Expansion

-- 1. Categorized Render Folders
CREATE TABLE IF NOT EXISTS project_renders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text NOT NULL,
  folder_name text NOT NULL DEFAULT 'Uncategorized',
  image_url text NOT NULL,
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
