import { NextResponse } from "next/server";
import { addUser, getUserById } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const { id, name, companyName, role } = body;
  
  if (!id || !name || !companyName) {
    return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
  }

  const existingUser = getUserById(id);
  if (existingUser) {
    return NextResponse.json({ success: false, error: "A user with this Aadhaar already exists." }, { status: 400 });
  }

  addUser({ id, name, companyName, role });
  
  return NextResponse.json({ success: true });
}
