// lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  // Não faça isso no topo do módulo!
  if (!url || !key) {
    // Lança aqui (em runtime), não no build
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
