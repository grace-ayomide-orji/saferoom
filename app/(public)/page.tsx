import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Calendar, Links, Chat, Heart } from "@/components/icons";
import heroImage from "@/public/hero.png";

async function getProfile() {
  try {
    return await prisma.counselorProfile.findFirst();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden md:px-6 px-4 py-20 lg:py-28 md:py-23">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-12 md:gap-6 gap-y-10 items-center max-w-6xl mx-auto">
          
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              You don't have to{" "}
              <span className="text-brand-cherry ">carry this alone.</span>
            </h1>
            <p className=" text-base mt-6 lg:text-lg text-gray-600 leading-relaxed max-w-lg">
              Safe Room offers free, confidential online counseling
              sessions rooted in faith and genuine care. No accounts, no
              pressure - just a safe space to be heard.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/book" className="btn-primary text-base px-6 py-1.5">
                Book a Session
              </Link>
              <Link href="/about" className="btn-secondary text-base px-6 py-1.5">
                Meet Us
              </Link>
            </div>
            
            <div className="flex items-center md:justify-start justify-between lg:gap-6 md:gap-4  md:mt-10 mt-8 pt-5 border-t border-gray-200 lg:mr-40 md:mr-15">
              <div className="text-center">
                <p className="text-xl font-black text-brand-cherry">100%</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Free</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-xl font-black text-brand-cherry">Private</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Confidential</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-xl font-black text-brand-cherry">Online</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Google Meet</p>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="relative rounded-4xl lg:w-120 lg:h-100 md:w-80 md:h-80 sm:w-[90vw] sm:h-100 w-72 h-72 overflow-hidden shadow-cherry-lg border-4 border-white bg-white custom-radius">
                {profile?.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    fill
                    className="w-full h-auto"
                  />
                ) : (
                  <Image
                    src={heroImage}
                    alt="Image of a counsellor counselling"
                    fill
                    className="w-full h-auto"
                  />
                )}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white md:rounded-2xl rounded-xl shadow-cherry lg:p-4 p-2 border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold">Sessions via</p>
                <p className="text-brand-cherry font-black text-sm">Google Meet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="lg:py-20 md:py-12 py-10 md:px-6 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center lg:mb-14 mb-10">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Getting support is simple. No forms, no waiting rooms, no barriers.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:gap-8 md:gap-4 gap-3">
          {[
            {
              step: "01",
              title: "Choose a time",
              desc: "Pick a date and time slot that works for you from our live availability.",
              icon: Calendar,
            },
            {
              step: "02",
              title: "Get your link",
              desc: "Receive a secure Google Meet link and a management URL - no account needed.",
              icon: Links,
            },
            {
              step: "03",
              title: "Show up & talk",
              desc: "Join the session at your scheduled time. Our counselor will be there, ready to listen.",
              icon: Chat,
            },
          ].map((item) => (
            <div key={item.step} className="card relative overflow-hidden group hover:shadow-cherry transition-all">
              <div className="lg:text-2xl text-xl lg:mb-4 mb-2 text-brand-cherry-soft"><item.icon/>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto text-center mt-10">
          <Link href="/book" className="btn-primary py-3 px-5">
            Book Your Session Now
          </Link>
        </div>
      </section>

      {/* ── Mission strip ────────────────────────── */}
      <section className="bg-cherry-gradient md:py-16 py-12 md:px-6 px-2">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand-cherry-soft text-sm font-bold uppercase tracking-widest mb-4">
            Our Mission
          </p>
          <h2 className="text-xl lg:text-4xl md:text-3xl font-black text-white leading-tight">
            "Making counseling accessible to everyone regardless of circumstance."
          </h2>
          <p className="text-white/70 lg:mt-6 mt-4 md:text-base text-[15px] leading-relaxed">
            Safe Room is committed to
            providing free, faith-rooted counseling to individuals who need it
            most. Every session is completely free.
          </p>
        </div>
      </section>

      {/* ── Donate CTA ───────────────────────────── */}
      <section className="bg-white md:py-20 py-12 lg:px-2 md:px-4 px-2">
        <div className="max-w-6xl mx-auto md:py-14 py-8 md:px-8 sm:px-4 px-2 bg-brand-smoke rounded-3xl flex flex-col md:flex-row md:items-center justify-between md:gap-8 gap-y-5">
          <div className="max-w-lg">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
              Help keeps this mission free.
            </h2>
            <p className="text-gray-500 mt-3 leading-relaxed md:text-base text-[15px] ">
              Every donation helps us continue offering free sessions to people
              who need them. No amount is too small, your generosity creates
              real change.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/donate" className="flex items-center justify-center gap-x-1 btn-coral text-base lg:px-8 px-6 md:py-4 py-2.5 lg:mr-[100px] sm:w-fit">
              Make a Donation <Heart/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}