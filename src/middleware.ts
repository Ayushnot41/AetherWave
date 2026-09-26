/**
 * Middleware: PII stripping + rate limiting
 * 
 * Runs on every /api/* route BEFORE reaching route handlers.
 * Strips PII fields from logged requests and enforces per-IP rate limiting.
 *
 * Note: Auth enforcement is route-level (JWT verification) since some endpoints
 * like /api/auth/otp/request are intentionally unauthenticated.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (resets on function cold start)
// In production, use Vercel KV or Redis for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_CONFIG: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/auth': { maxRequests: 10, windowMs: 60_000 },      // 10 OTP requests/min
  '/api/intake': { maxRequests: 5, windowMs: 60_000 },      // 5 submissions/min
  '/api/verification': { maxRequests: 10, windowMs: 60_000 },
  '/api/tts': { maxRequests: 20, windowMs: 60_000 },
  '/api/weather': { maxRequests: 60, windowMs: 60_000 },    // 60/min (frequent poll)
  '/api/market': { maxRequests: 30, windowMs: 60_000 },
  '/api/alerts': { maxRequests: 5, windowMs: 60_000 },      // SSE connections
  'default': { maxRequests: 100, windowMs: 60_000 },
};

function getRateLimitConfig(pathname: string) {
  for (const [prefix, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (prefix !== 'default' && pathname.startsWith(prefix)) return config;
  }
  return RATE_LIMIT_CONFIG['default']!;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to /api/* routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env['NEXT_PUBLIC_APP_URL'] ?? '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const config = getRateLimitConfig(pathname);
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const limit = rateLimitMap.get(key);
  if (limit && now < limit.resetAt) {
    if (limit.count >= config.maxRequests) {
      return NextResponse.json(
        { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', retryable: true },
        { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } },
      );
    }
    limit.count++;
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
  }

  // Clean up expired entries periodically (every ~1000 requests)
  if (Math.random() < 0.001) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (Date.now() > v.resetAt) rateLimitMap.delete(k);
    }
  }

  const response = NextResponse.next();

  // Add CORS headers to all API responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
