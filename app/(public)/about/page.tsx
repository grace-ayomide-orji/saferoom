import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Growth, Lock, Heart } from "@/components/icons";

export const metadata: Metadata = { title: "About Safe Room" };

async function getProfile() {
  try {
    return await prisma.counselorProfile.findFirst();
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="page-enter max-w-5xl mx-auto md:px-6 px-4 lg:py-16 py-6">
      {/* Profile card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-12 gap-8 items-start my-16">
        <div className="flex justify-center">
          <div className="relative w-80 h-96 rounded-3xl overflow-hidden shadow-cherry-lg border-4 border-white">
            {profile?.photoUrl ? (
              <Image src={profile.photoUrl} alt={profile.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 lg:mb-4 mb-2">
            {profile?.name || "Safe Room"}
          </h2>

          {profile?.qualifications && profile.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.qualifications.map((q, i) => (
                <span
                  key={i}
                  className="bg-brand-cherry/10 text-brand-cherry text-xs font-bold px-3 py-1 rounded-full"
                >
                  {q}
                </span>
              ))}
            </div>
          )}

          {profile?.bio ? (
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
              {profile.bio.split("\n").map((para, i) => (
                <p key={i} className="lg:mb-4 mb-2">{para}</p>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 leading-relaxed space-y-4">
              <p>
                She is a faith-based counselor and pastor with a heart for
                people walking through difficult seasons of life. Whether it's
                grief, anxiety, relationship struggles, or simply feeling lost,
                She provides a compassionate, non-judgmental space to be heard
                and supported.
              </p>
              <p>
                All sessions are completely free as an expression of ministry
                and service, made possible through the generosity of donors who
                believe in this work.
              </p>
            </div>
          )}

          <div className="lg:mt-8 mt-5 flex flex-wrap lg:gap-3 gap-2">
            <Link href="/book" className="btn-primary py-2 lg:px-5 px-3 md:w-fit w-full text-center flex-1">
              Book a Session
            </Link>
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex-1 btn-secondary py-2 lg:px-5 px-3 md:w-fit w-full text-center">
                Send an Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:gap-6 gap-3">
        {[
          {
            icon: Growth,
            title: "Faith-Rooted",
            desc: "Every session is grounded in prayer, compassion, and trust in God's guidance.",
          },
          {
            icon: Lock,
            title: "Confidential",
            desc: "What you share stays between you and your conselor. Your privacy is always respected.",
          },
          {
            icon: Heart,
            title: "Completely Free",
            desc: "Sessions will always be free. This is a ministry, not a business.",
          },
        ].map((v) => (
          <div key={v.title} className="card text-center lg:space-y-2 space-y-1">
            <div className="text-4xl mb-3b flex justify-center text-brand-coral"><v.icon/></div>
            <h3 className="font-extrabold text-gray-900 text-lg">{v.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}