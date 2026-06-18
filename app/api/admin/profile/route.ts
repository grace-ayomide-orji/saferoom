import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { counselorProfileSchema } from "@/lib/validations";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.counselorProfile.findFirst();
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = counselorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  let profile = await prisma.counselorProfile.findFirst();

  if (profile) {
    profile = await prisma.counselorProfile.update({
      where: { id: profile.id },
      data: parsed.data,
    });
  } else {
    profile = await prisma.counselorProfile.create({ data: parsed.data });
  }

  return NextResponse.json({ profile });
}