import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!, // SERVICE ROLE! (server only)
  {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "claim-backend" } },
  }
);
