"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Logo from "@/public/logo.png"
import Image from "next/image"
import { Burger, X } from "./icons"

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
];

export const Header = () => {
    const pathname = usePathname()
    const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

    const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);

    return( 
        <header className="rounded-custom sticky top-5 mx-6 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Image src={Logo} alt="our logo" className="md:w-[100px] md:w-[80px] w-[40px] h-[40px]" height={60} width={60} priority style={{ width: "auto" }}/>
                </Link>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${isActive(link.href) ? "text-brand-cherry bg-brand-smoke" : "text-gray-600 hover:text-brand-cherry" }`}
                    >
                        {link.label}
                    </Link>
                    ))}
                </nav>

                {/* CTA Buttons */}
                <div className="flex items-center justify-end gap-x-3">
                    <Link href="/donate" className="btn-coral text-sm py-2 px-4">
                    Donate
                    </Link>
                    <Link href="/book" className="hidden md:block btn-primary text-sm py-2 px-4">
                        Book Session
                    </Link>
                    
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-slate-600"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Burger size={20} />}
                    </button>
                </div>

            </div>
            {mobileMenuOpen && (
                <div className="z-100 bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 flex flex-col gap-1">
                    {NAV_LINKS.map((l) => (
                    <Link
                        key={l.label}
                        href={l.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-2 px-3 text-sm font-medium rounded-xl transition-all ${
                        isActive(l.href)
                            ? "text-brand-cherry bg-brand-smoke"
                            : "text-gray-600 hover:text-brand-cherry"
                        }`}
                    >
                        {l.label}
                    </Link>
                    ))}
                    <hr className="my-2 border-slate-100" />
                    <Link href="/book" className="btn-primary text-sm py-2 px-4 mt-1"
                        onClick={() => setMobileMenuOpen(false)}>
                        Book Session
                    </Link>
                </div>
            )}
        </header>
    )
}