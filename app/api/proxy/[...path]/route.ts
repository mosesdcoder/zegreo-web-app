import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const COOKIE_NAME = "zogreo_token";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  const headers = new Headers();

  // Forward content-type and org slug from the original request
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  const orgSlug = req.headers.get("X-Org-Slug");
  if (orgSlug) headers.set("X-Org-Slug", orgSlug);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const upstream = await fetch(backendUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    // @ts-expect-error — duplex required when forwarding a streaming body
    duplex: hasBody ? "half" : undefined,
  });

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("Content-Type", contentType);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
