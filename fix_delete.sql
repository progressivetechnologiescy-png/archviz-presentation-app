-- Fix for renders not deleting
create policy "Allow anonymous deletes on renders"
  on project_renders for delete
  using (true);
