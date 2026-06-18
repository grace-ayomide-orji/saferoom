import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { passwordSettingSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = passwordSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Verify current password before allowing the change
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
  });

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentPasswordValid = await bcrypt.compare(
    parsed.data.currentPassword,
    admin.passwordHash
  );

  if (!currentPasswordValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.adminUser.update({
    where: { id: session.adminId },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true, message: "Password changed successfully" });
}