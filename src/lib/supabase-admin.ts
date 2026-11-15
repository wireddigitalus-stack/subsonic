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

// The project URL is public (not a secret) — fall back to it so the server can
// connect even if the hosting env var is missing or misnamed.
const DEFAULT_SUPABASE_URL = "https://adwqbeumdbcaltobdedb.supabase.co";
const envUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const url = envUrl.startsWith("http") ? envUrl : DEFAULT_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const key = serviceKey || anonKey;

export const isDbConfigured = Boolean(url && key && url.startsWith("http"));
export const hasServiceKey = Boolean(serviceKey);

const DB_TIMEOUT_MS = 1800;
const CIRCUIT_COOLDOWN_MS = 20_000;
let circuitOpenUntil = 0;

export function isDbCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

const resilientFetch: typeof fetch = async (input, init) => {
  if (Date.now() < circuitOpenUntil) {
    return new Response(
      JSON.stringify({
        code: "PGRST002",
        details: null,
        hint: null,
        message: "Supabase temporarily unavailable (fast-fail circuit breaker active).",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (res.status === 502 || res.status === 503 || res.status === 504 || (res.status >= 520 && res.status <= 544)) {
      circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    } else if (res.ok || (res.status >= 200 && res.status < 500)) {
      circuitOpenUntil = 0;
    }

    return res;
  } catch (err: any) {
    circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    return new Response(
      JSON.stringify({
        code: "PGRST002",
        details: null,
        hint: null,
        message: `Supabase connection timed out or failed (${err?.message || "timeout"}).`,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    clearTimeout(timer);
  }
};

export const db: SupabaseClient | null = isDbConfigured
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: resilientFetch },
    })
  : null;
