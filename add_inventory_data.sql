-- Safe migration to add inventory_data jsonb column to properties_config
alter table properties_config add column if not exists inventory_data jsonb default '[]'::jsonb;
