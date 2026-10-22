const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qljiwwwybzqpksjwevzj.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaml3d3d5YnpxcGtzandldnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzg5NDMsImV4cCI6MjA5Mzg1NDk0M30.N6Y_j9uT8XKa4cQVnPe51ibQldA-45NliyrxCbK_6FE';

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/properties_config?select=project_id&limit=1`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const status = response.status;
    return res.status(200).json({
      ok: response.ok,
      supabaseStatus: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
