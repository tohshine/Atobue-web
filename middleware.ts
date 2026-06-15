import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyCorsHeaders, getCorsHeaders, isAllowedOrigin } from "@/lib/cors";

const PROBE_PREFIXES = [
  "/admin",
  "/administrator",
  "/dashboard",
  "/wp-admin",
  "/backend",
  "/console",
  "/manage",
  "/cms",
  "/panel",
  "/staff",
];

function handleApiCors(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  const response = NextResponse.next();
  applyCorsHeaders(response.headers, origin);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return handleApiCors(request);
  }

  if (PROBE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/administrator",
    "/administrator/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/wp-admin",
    "/wp-admin/:path*",
    "/backend",
    "/backend/:path*",
    "/console",
    "/console/:path*",
    "/manage",
    "/manage/:path*",
    "/cms",
    "/cms/:path*",
    "/panel",
    "/panel/:path*",
    "/staff",
    "/staff/:path*",
  ],
};
