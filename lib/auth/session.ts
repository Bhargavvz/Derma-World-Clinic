import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import type { StaffRole } from "@/lib/content/types";
import { SESSION_COOKIE } from "./constants";

export interface StaffUser {
  uid: string;
  email: string;
  role: StaffRole;
}

/** Verify the httpOnly session cookie (checking revocation) and the role claim. */
export const getStaff = cache(async (): Promise<StaffUser | null> => {
  if (!isAdminConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const role = decoded.role as StaffRole | undefined;
    if (role !== "owner" && role !== "staff") return null;
    return { uid: decoded.uid, email: decoded.email ?? "", role };
  } catch {
    return null;
  }
});

/** For pages: redirect to login when there is no valid session / role. */
export async function requireStaffPage(role?: StaffRole): Promise<StaffUser> {
  const user = await getStaff();
  if (!user) redirect("/admin/login");
  if (role === "owner" && user.role !== "owner") redirect("/admin?denied=1");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "unauthenticated" | "forbidden") {
    super(code);
  }
}

/** For server actions: throw when there is no valid session / role. */
export async function requireStaff(role?: StaffRole): Promise<StaffUser> {
  const user = await getStaff();
  if (!user) throw new AuthError("unauthenticated");
  if (role === "owner" && user.role !== "owner") throw new AuthError("forbidden");
  return user;
}
