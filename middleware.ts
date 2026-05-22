import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROBE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
