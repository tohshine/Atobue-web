import { NextRequest, NextResponse } from "next/server";
import { applyCorsHeaders, getCorsHeaders, isAllowedOrigin } from "@/lib/cors";
import { serverApiConfig } from "@/lib/api/server-config";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function rewriteCookieForProxy(cookie: string, isSecureContext: boolean): string {
  let rewritten = cookie
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*SameSite=Strict/gi, "; SameSite=Lax");

  if (!isSecureContext) {
    rewritten = rewritten.replace(/;\s*Secure/gi, "");
  }

  return rewritten;
}

function collectSetCookies(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const targetUrl = `${serverApiConfig.backendUrl.replace(/\/$/, "")}/${path}${request.nextUrl.search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === "host") {
      return;
    }
    forwardHeaders.set(key, value);
  });

  forwardHeaders.set("Origin", serverApiConfig.proxyOrigin);
  forwardHeaders.set("Referer", serverApiConfig.proxyOrigin);
  forwardHeaders.set("X-Forwarded-Host", request.headers.get("host") ?? "localhost");
  forwardHeaders.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));

  const cookie = request.headers.get("cookie");
  if (cookie) {
    forwardHeaders.set("cookie", cookie);
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || HOP_BY_HOP_HEADERS.has(lower)) {
      return;
    }
    responseHeaders.set(key, value);
  });

  const isSecureContext = request.nextUrl.protocol === "https:";

  for (const rawCookie of collectSetCookies(upstream.headers)) {
    responseHeaders.append("set-cookie", rewriteCookieForProxy(rawCookie, isSecureContext));
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

async function handle(request: NextRequest, context: RouteContext) {
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

  const { path } = await context.params;
  const response = await proxyRequest(request, path);
  applyCorsHeaders(response.headers, origin);
  return response;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
