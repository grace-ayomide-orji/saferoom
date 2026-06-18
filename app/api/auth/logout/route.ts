import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}