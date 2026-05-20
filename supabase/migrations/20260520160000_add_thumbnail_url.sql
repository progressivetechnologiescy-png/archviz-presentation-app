-- Safe migration to add thumbnail_url text column to project_renders
alter table project_renders add column if not exists thumbnail_url text;
