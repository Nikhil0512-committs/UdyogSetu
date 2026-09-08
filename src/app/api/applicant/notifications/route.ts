import { NextResponse } from "next/server";
import { getNotifications, markNotificationRead } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ notifications: getNotifications() });
}

export async function POST(request: Request) {
  const { id } = await request.json();
  markNotificationRead(id);
  return NextResponse.json({ success: true });
}
