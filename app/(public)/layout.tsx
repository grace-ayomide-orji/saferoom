import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer"
import { prisma } from "@/lib/prisma";


async function getProfile() {
  try {
    return await prisma.counselorProfile.findFirst();
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col bg-brand-smoke">
      {/* ── Header ───────────────────────────────── */}
      <Header/>

      {/* ── Main content ─────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────── */}
      <Footer profile={profile}/>
    </div>
  );
}