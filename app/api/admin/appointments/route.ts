import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) where.date = new Date(date + "T00:00:00");

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { booker: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ bookings, total, page, limit }, {status:200});
}

// PATCH — update status (complete, no-show, cancel)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, notes } = body;

  const booking = await prisma.booking.update({
    where: { id },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
    include: { booker: true },
  });

  return NextResponse.json({ booking });
}