import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter for API routes.
 * 
 * On Vercel serverless, each cold start resets the map — this provides
 * per-instance protection against rapid-fire abuse within a single
 * function lifecycle. For production-grade limiting, use Vercel's
 * Edge Middleware with KV or Upstash Redis.
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMITS: Record<string, number> = {
  "/api/admin/auth": 10,       // 10 login attempts per minute
  "/api/join": 5,              // 5 member signups per minute
  "/api/shooters": 10,         // 10 shooter operations per minute
  "/api/invites": 15,          // 15 invite operations per minute
  "/api/contact": 5,           // 5 contact form submissions per minute
  "/api/register": 5,          // 5 registrations per minute
  "/api/callsigns/check": 30,  // 30 callsign checks per minute (live validation)
};

const DEFAULT_RATE_LIMIT = 60; // 60 requests per minute for unlisted routes

function getClientIdentifier(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "unknown"
  );
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  });
}, 300_000);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Only rate-limit mutating requests (POST, PUT, PATCH, DELETE)
  // Allow GET requests through without limits (read operations)
  if (req.method === "GET") {
    return NextResponse.next();
  }

  const clientId = getClientIdentifier(req);

  // Find the most specific matching route
  const matchedRoute = Object.keys(RATE_LIMITS)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  const maxRequests = matchedRoute
    ? RATE_LIMITS[matchedRoute]
    : DEFAULT_RATE_LIMIT;

  const rateLimitKey = `${clientId}:${matchedRoute || pathname}`;

  if (isRateLimited(rateLimitKey, maxRequests)) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment before trying again.",
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
          "X-RateLimit-Limit": String(maxRequests),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
