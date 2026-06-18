import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { workingHoursSchema, blockedDateSchema } from "@/lib/validations";

// GET working hours + blocked dates
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [workingHours, blockedDates] = await Promise.all([
    prisma.workingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);

  return NextResponse.json({ workingHours, blockedDates });
}

// POST — update working hours or add blocked date
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "working_hours") {
    const parsed = workingHoursSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.workingHours.upsert({
      where: { dayOfWeek: parsed.data.dayOfWeek },
      update: parsed.data,
      create: parsed.data,
    });

    return NextResponse.json({ workingHours: updated });
  }

  if (type === "blocked_date") {
    const parsed = blockedDateSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const blocked = await prisma.blockedDate.upsert({
      where: { date: new Date(parsed.data.date + "T00:00:00") },
      update: { reason: parsed.data.reason },
      create: {
        date: new Date(parsed.data.date + "T00:00:00"),
        reason: parsed.data.reason,
      },
    });

    return NextResponse.json({ blockedDate: blocked });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// DELETE — remove blocked date
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.blockedDate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}