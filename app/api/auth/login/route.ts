import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, buildSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";


const GENERIC_AUTH_ERROR = "Invalid email or password";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip, "login", {
    max: 5,            
    windowSeconds: 1800 
  });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": limit.resetAt.toISOString(),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const { email, password } = parsed.data;
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const valid = await verifyPassword(password, admin?.passwordHash ?? null);

    if (!admin || !valid) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const signedToken = await createSession(admin.id);
    const cookie = buildSessionCookie(signedToken);

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}