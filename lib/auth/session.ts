import type { User, UserRole } from "@/lib/types";

// Claim URIs used by the .NET backend
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_PHONE = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone";

export interface SessionPayload {
  sub: string;
  org: string;
  exp: number;
  [CLAIM_ROLE]: string;
  [CLAIM_EMAIL]: string;
  [CLAIM_PHONE]?: string;
  fullName?: string;
  phoneVerified?: boolean;
}

export function decodeJwt(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: SessionPayload): boolean {
  return Date.now() / 1000 > payload.exp;
}

export function getRoleFromPayload(payload: SessionPayload): UserRole {
  const raw = payload[CLAIM_ROLE] ?? "";
  // Backend uses "Applicant", "Registrar", etc. — normalise to our enum
  const map: Record<string, UserRole> = {
    applicant: "APPLICANT",
    registrar: "REGISTRAR",
    bursar: "BURSAR",
    superadmin: "SUPER_ADMIN",
    super_admin: "SUPER_ADMIN",
  };
  return map[raw.toLowerCase()] ?? "APPLICANT";
}

export function isAdminRole(role: UserRole | string): boolean {
  const normalised = typeof role === "string" ? role.toLowerCase() : role;
  return (
    normalised === "REGISTRAR" ||
    normalised === "BURSAR" ||
    normalised === "SUPER_ADMIN" ||
    normalised === "registrar" ||
    normalised === "bursar" ||
    normalised === "superadmin" ||
    normalised === "super_admin"
  );
}

export function sessionPayloadToUser(payload: SessionPayload): Partial<User> {
  const role = getRoleFromPayload(payload);
  const fullName = payload.fullName ?? "";
  const [firstName, ...rest] = fullName.split(" ");
  return {
    id: payload.sub,
    email: payload[CLAIM_EMAIL] ?? "",
    phone: payload[CLAIM_PHONE] ?? "",
    phoneVerified: payload.phoneVerified ?? false,
    role,
    orgSlug: payload.org ?? "zogreo",
    firstName: firstName ?? "",
    lastName: rest.join(" "),
  };
}
