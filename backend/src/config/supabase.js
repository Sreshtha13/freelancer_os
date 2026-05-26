import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase env vars missing — database calls will fail');
}

/** Service-role client for backend (bypasses RLS; always filter by user_id) */
export const supabaseAdmin = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** User-scoped client with JWT for RLS-aware operations */
export function createUserClient(accessToken) {
  return createClient(supabaseUrl ?? '', process.env.SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}
