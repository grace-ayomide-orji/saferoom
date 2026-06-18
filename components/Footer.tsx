"use client"
import Link from "next/link"
import { ArrowRight } from "./icons";
// import Logo from "@/public/logo.png"
// import Image from "next/image"

interface Profile{
    id: string;
    name: string;
    bio: string | null;
    photoUrl: string | null;
    qualifications: string[];
    email: string | null;
    phone: string | null;
    website: string | null;
    instagram: string | null;
    twitter: string | null;
    updatedAt: Date;
}

export const Footer = ({ profile } : {profile: Profile | null}) => {
   
    return( 
        <footer className="bg-brand-cherry text-white mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                    <div className="flex items-center gap-2 mb-3">
                        {/* <div className="p-2 rounded-lg bg-white flex items-center justify-center">
                               <Image src={Logo} alt="our logo" height={60} width={60} priority style={{ width: "auto" }}/>
                        </div> */}
                        <span className="font-extrabold text-lg">Save Room</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Free online counseling sessions rooted in faith, compassion,
                        and care. You are not alone.
                    </p>
                    </div>

                    <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-white/60 mb-4">
                        Quick Links
                    </h4>
                    <ul className="space-y-2">
                        {[
                        { href: "/book", label: "Book a Session" },
                        { href: "/donate", label: "Donate" },
                        { href: "/contact", label: "Contact" },
                        ].map((link) => (
                        <li key={link.href}>
                            <Link
                            href={link.href}
                            className="text-white/70 hover:text-white text-sm transition-colors"
                            >
                            {link.label}
                            </Link>
                        </li>
                        ))}
                    </ul>
                    </div>

                    <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-white/60 mb-4">
                        Get in Touch
                    </h4>
                    {profile?.email && (
                        <p className="text-white/70 text-sm mb-2">
                        <span className="text-white/40 text-xs block">Email</span>
                        <a
                            href={`mailto:${profile.email}`}
                            className="hover:text-white transition-colors"
                        >
                            {profile.email}
                        </a>
                        </p>
                    )}
                    {profile?.instagram && (
                        <p className="text-white/70 text-sm mb-2">
                        <span className="text-white/40 text-xs block">Instagram</span>
                        <a
                            href={`https://instagram.com/${profile.instagram}`}
                            className="hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @{profile.instagram}
                        </a>
                        </p>
                    )}
                    <div className="mt-6">
                        <Link
                        href="/book"
                        className="flex items-center justify-center gap-x-2 bg-white text-brand-cherry font-bold px-5 py-2.5 rounded-xl hover:bg-brand-smoke transition-all shadow-md text-sm w-fit"
                        >
                        Book a Free Session <ArrowRight className="w-4 h-4"/>
                        </Link>
                    </div>
                    </div>
                </div>
            </div>

              <p className="text-white/40 text-xs mt-4 font-medium text-center py-2 border border-white/20">
                    © {new Date().getFullYear()} Safe Room. All right reserved. {" "} <Link href="/privacy" className="hover:underline">Privacy Policy.</Link>
                </p>
        </footer>
    )
}