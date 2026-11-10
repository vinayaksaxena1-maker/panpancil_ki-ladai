export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.MB_PUB_SUPABASE_URL || 'https://boavalkwiixcpkwvccyk.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.MB_PUB_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.MB_PUB_SUPABASE_PUBLISHABLE_KEY || '';
  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    hasAnonKey: Boolean(supabaseAnonKey)
  });
}
