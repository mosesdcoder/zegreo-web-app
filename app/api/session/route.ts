import { NextRequest, NextResponse } from "next/server";
import { decodeJwt, sessionPayloadToUser } from "@/lib/auth/session";
import { cookies } from "next/headers";

const COOKIE_NAME = "zogreo_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// GET /api/session — returns decoded user from cookie
export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json(null, { status: 200 });

  const payload = decodeJwt(token);
  if (!payload) return NextResponse.json(null, { status: 200 });

  const user = sessionPayloadToUser(payload);

  // Supplement with fullName cookie if stored at login
  const fullName = jar.get("zogreo_name")?.value;
  if (fullName) {
    const [first, ...rest] = fullName.split(" ");
    user.firstName = first;
    user.lastName = rest.join(" ");
  }

  return NextResponse.json(user);
}

// POST /api/session — sets the httpOnly cookie
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const { token, fullName, email: bodyEmail } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  // Attach extra fields from login response that aren't in the JWT claims
  if (fullName) payload.fullName = fullName;

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, COOKIE_OPTIONS);

  // Store fullName in a separate readable cookie for client-side access
  if (fullName) {
    jar.set("zogreo_name", fullName, { ...COOKIE_OPTIONS, httpOnly: false });
  }

  return NextResponse.json({ ...sessionPayloadToUser(payload), fullName });
}

// DELETE /api/session — clears the cookie
export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  jar.delete("zogreo_name");
  return NextResponse.json({ ok: true });
}
