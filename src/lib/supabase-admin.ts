/**
 * Server-only Supabase client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (secret key) so server routes can read/write
 * members, shooters, invites and chat even when Row Level Security blocks the
 * public anon key. NEVER import this file from a "use client" component.
 *
 * Falls back to the public anon key if the secret key is missing so local
 * development without the key keeps working.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabase-admin must only be imported on the server.");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const key = serviceKey || anonKey;

export const isDbConfigured = Boolean(url && key && url.startsWith("http"));
export const hasServiceKey = Boolean(serviceKey);

export const db: SupabaseClient | null = isDbConfigured
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
