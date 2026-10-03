import { NextResponse } from "next/server";
import { db, isDbConfigured, hasServiceKey } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Safe DB diagnostics — reports only booleans, the public project ref and
 * row counts. Never returns keys.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const projectRef = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1] || null;
  const result: Record<string, unknown> = {
    serverless: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey,
    isDbConfigured,
    projectRef,
  };

  if (db) {
    const counts: Record<string, number | string> = {};
    for (const table of ["society_members", "shooters", "invites", "chat_messages"]) {
      const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
      counts[table] = error ? `error: ${error.message}` : count ?? 0;
    }
    result.counts = counts;
  }

  return NextResponse.json(result);
}
