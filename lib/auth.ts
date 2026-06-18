import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";


export const SESSION_COOKIE = "admin_session";
const SESSION_EXPIRY_DAYS = 1;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET env var is missing");
  }
  return secret;
}


/**
 * Sign a sessionId and return the full cookie value:  id.signature
 */
export function signSession(sessionId: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(sessionId)
    .digest("hex");
  return `${sessionId}.${sig}`;
}

/**
 * Verify and extract the sessionId from a cookie value.
 * Returns null if the signature is invalid or tampered.
 */
export function verifySessionCookie(cookieValue: string): string | null {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const sessionId = cookieValue.slice(0, dotIndex);
  const receivedSig = cookieValue.slice(dotIndex + 1);

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(sessionId)
    .digest("hex");

  // Constant-time comparison prevents timing attacks
  const sigBuffer = Buffer.from(receivedSig, "hex");
  const expBuffer = Buffer.from(expectedSig, "hex");

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  return sessionId;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Always runs bcrypt.compare even if user doesn't exist.
 * This prevents timing-based email enumeration.
 */
export async function verifyPassword(
  password: string,
  hash: string | null
): Promise<boolean> {
  const dummyHash =
    "$2b$12$invalidhashfortimingprotectionXXXXXXXXXXXXXXXXXXXXXXX";
  return bcrypt.compare(password, hash ?? dummyHash);
}

// ── Session lifecycle ────────────────────────────────────────────────────────

export async function createSession(adminId: string): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.adminSession.create({
    data: { token: sessionId, adminId, expiresAt },
  });

  return signSession(sessionId);
}

export async function getSession() {
  const cookieStore = await cookies(); 
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  const sessionId = verifySessionCookie(cookieValue);
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token: sessionId },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.adminSession.delete({ where: { token: sessionId } });
    }
    return null;
  }

  return session;
}

export async function deleteSession(cookieValue: string) {
  const sessionId = verifySessionCookie(cookieValue);
  if (!sessionId) return;
  await prisma.adminSession.delete({ where: { token: sessionId } }).catch(() => {});
}

export function buildSessionCookie(signedToken: string) {
  return {
    name: SESSION_COOKIE,
    value: signedToken,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
      path: "/",
    },
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}