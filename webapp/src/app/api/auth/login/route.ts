import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const { role, name, department, id } = body;
  
  if (role === "APPLICANT" && id) {
    const user = getUserById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
    }
    // Update name to actual user name if they entered their ID correctly
    var actualName = user.name;
  }
  
  const session = {
    userId: role === "APPLICANT" ? "app-user-1" : `off-${(department || "admin").toLowerCase().replace(/[^a-z]/g, "")}-1`,
    role,
    name: role === "APPLICANT" ? (actualName || name) : name,
    department: department || undefined,
  };
  
  const cookieStore = await cookies();
  cookieStore.set("mock_session", JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24
  });
  
  return NextResponse.json({ success: true, session });
}
