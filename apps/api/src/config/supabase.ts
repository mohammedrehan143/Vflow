import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && serviceKey && !url.includes('your-project')) {
    if (!supabaseClient) {
      supabaseClient = createClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return supabaseClient;
  }
  return null;
}
