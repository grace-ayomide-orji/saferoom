"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Home, Dashboard, Calendar, Clock, Heart, User, Logout, Burger, Cancel } from "@/components/icons"
import { format } from "date-fns";
import Logo from "@/public/logo.png"
import Image from "next/image"


const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin/dashboard", label: "Dashboard", icon: Dashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: Clock },
  { href: "/admin/donations", label: "Donations", icon: Heart },
  { href: "/admin/profile", label: "My Profile", icon: User },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const today = format(new Date(), "EEEE, MMMM d");
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

   const pageName = useMemo(() => {
    const currentPage = NAV_ITEMS.find(item => 
      pathname === item.href || pathname.startsWith(item.href + "/")
    );
    return currentPage?.label || "Dashboard";
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-6 flex items-center h-[70px] border-b border-white/10">
        <Link href="/admin/dashboard" className="font-extrabold bg-white block w-fit p-3 rounded-full text-base leading-none">
          <Image src={Logo} alt="our logo" height={40} width={40} priority style={{ width: "auto" }}/>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-brand-cherry shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4"/>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-2 border-t border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <Logout className="w-4 h-4"/>
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-brand-smoke font-nunito">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-cherry-gradient fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-cherry-gradient flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="sticky h-[70px] top-0 z-30 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)] px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">{pageName}</h1>
            <p className="text-gray-500 text-sm">{today}</p>
          </div>
          <div className="w-9" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex flex-col justify-center items-center outline-none bg-transparent text-brand-cherry"
          >
            {mobileOpen ? <Cancel className="w-5 h-5" /> :<Burger className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}