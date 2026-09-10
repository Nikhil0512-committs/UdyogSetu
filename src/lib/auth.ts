import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "APPLICANT" | "OFFICER";

export interface MockSession {
  userId: string;
  role: Role;
  name: string;
  companyName?: string;
  department?: string; // e.g. "MIDC", "MPCB", "Fire Services Department", etc.
}

export async function getSession(): Promise<MockSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mock_session");
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value) as MockSession;
  } catch {
    return null;
  }
}

export async function requireAuth(role?: Role) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  if (role && session.role !== role) {
    redirect(session.role === "APPLICANT" ? "/dashboard" : "/officer/dashboard");
  }
  
  return session;
}
