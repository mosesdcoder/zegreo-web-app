"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

async function fetchSession(): Promise<User | null> {
  const res = await fetch("/api/session", { credentials: "include" });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user) return null;

  // If name missing from JWT claims, read from zogreo_name cookie (set at login)
  if (!user.firstName && typeof document !== "undefined") {
    const nameCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("zogreo_name="))
      ?.split("=")
      .slice(1)
      .join("=");

    if (nameCookie) {
      const decoded = decodeURIComponent(nameCookie);
      const [first, ...rest] = decoded.split(" ");
      user.firstName = first;
      user.lastName = rest.join(" ");
    }
  }

  // Last resort: fetch /api/proxy/auth/me to get the full profile
  if (!user.firstName || !user.phone) {
    try {
      const meRes = await fetch("/api/proxy/auth/me", { credentials: "include" });
      if (meRes.ok) {
        const me = await meRes.json();
        const data = me?.data ?? me;

        if (!user.firstName) {
          const fullName: string = data?.fullName ?? "";
          if (fullName) {
            const [first, ...rest] = fullName.split(" ");
            user.firstName = first;
            user.lastName = rest.join(" ");
            document.cookie = `zogreo_name=${encodeURIComponent(fullName)}; path=/; max-age=${60 * 60 * 24 * 7}`;
          }
        }

        if (!user.phone) {
          const phone: string = data?.phone ?? data?.phoneNumber ?? data?.mobilePhone ?? "";
          if (phone) {
            user.phone = phone;
            document.cookie = `zogreo_phone=${encodeURIComponent(phone)}; path=/; max-age=${60 * 60 * 24 * 7}`;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Supplement phone from cookie if still missing
  if (!user.phone && typeof document !== "undefined") {
    const phoneCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("zogreo_phone="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (phoneCookie) user.phone = decodeURIComponent(phoneCookie);
  }

  return user;
}

export function useSession() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
  });

  return { user: user ?? null, isLoading };
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    // Clear name + phone cookies
    document.cookie = "zogreo_name=; path=/; max-age=0";
    document.cookie = "zogreo_phone=; path=/; max-age=0";
    qc.clear();
    router.push("/login");
  };
}
