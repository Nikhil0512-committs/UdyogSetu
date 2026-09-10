import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("mock_session");
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("mock_session");
  return NextResponse.json({ success: true });
}
