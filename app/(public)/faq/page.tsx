"use client";
import { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@/components/icons";

const FAQ_ITEMS = [
  {
    category: "Sessions",
    items: [
      {
        q: "How does a session work?",
        a: "You book a session online, receive a Google Meet link via email, and join at the scheduled time. No apps to download, just click the link. Sessions are one hour long.",
      },
      {
        q: "Is it really free?",
        a: "Yes, completely. Safe Room is an independent NGO body. Sessions will always be free, made possible through generous donations.",
      },
      {
        q: "Do I need to create an account?",
        a: "No account is needed. You just fill in your name and email when booking, and you'll receive a unique management link to view, reschedule, or cancel your appointment.",
      },
      {
        q: "What happens during a session?",
        a: "Efe will listen, ask questions, and provide guidance rooted in faith and care. Sessions are conversational and non-clinical. You set the pace.",
      },
      {
        q: "Can I have recurring sessions?",
        a: "Yes. You can book weekly, bi-weekly, or monthly recurring sessions during the booking process. Each session gets its own Google Meet link.",
      },
    ],
  },
  {
    category: "Privacy",
    items: [
      {
        q: "Is what I share kept confidential?",
        a: "Yes. Conversations with Efe are strictly confidential. Your information will never be shared with third parties. Please see our Privacy Policy for full details.",
      },
      {
        q: "What information do you collect?",
        a: "Only what is necessary: your name, email address, and optional phone number for booking. Your reason for counseling is optional and only visible to Efe.",
      },
      {
        q: "Where is my data stored?",
        a: "Your data is stored securely in an encrypted database hosted on Neon PostgreSQL. All communication is over HTTPS.",
      },
    ],
  },
  {
    category: "Scheduling",
    items: [
      {
        q: "How do I cancel or reschedule?",
        a: "Use the secure management link in your confirmation email. You can cancel or reschedule at any time, as long as it's at least 24 hours before your session.",
      },
      {
        q: "What timezone are sessions in?",
        a: "Efe's availability is shown in West Africa Time (WAT, UTC+1). The booking system will always display times in WAT, so please adjust accordingly.",
      },
      {
        q: "What if Efe is unavailable on my preferred date?",
        a: "Check back as new availability is added regularly. You can also send a message via the Contact page to request a specific time.",
      },
    ],
  },
  {
    category: "Donations",
    items: [
      {
        q: "Do I have to donate to book a session?",
        a: "Absolutely not. Donations are entirely voluntary and separate from bookings. Sessions are free regardless.",
      },
      {
        q: "What payment methods are accepted for donations?",
        a: "We accept international card payments via Stripe (Visa, Mastercard, etc.) and African payments via Flutterwave (including NGN, GHS, KES, and more).",
      },
      {
        q: "Will I get a receipt for my donation?",
        a: "Yes. If you provide your email address, you'll receive a donation receipt immediately after your payment is confirmed.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-bold text-gray-900 text-sm group-hover:text-brand-cherry transition-colors pr-4">
          {q}
        </span>
        <span
          className={`text-brand-cherry text-lg font-black flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto md:px-6 px-4 py-16">
      <div className="text-center md:mb-14 mb-8">
        <h1 className="text-xl md:text-2xl text-brand-coral">Frequently Asked Questions</h1>
        <p className="text-sm md:text-[15px] max-w-lg mx-auto">
              Everything you need to know about booking with Efe.
        </p>
      </div>

      <div className="space-y-8">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-cherry mb-3">
              {section.category}
            </h2>
            <div className="card p-0 divide-y divide-gray-100">
              {section.items.map((item) => (
                <div key={item.q} className="px-6">
                  <AccordionItem q={item.q} a={item.a} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-brand-cherry/5 rounded-2xl md:p-8 p-4 text-center  flex flex-col justify-center items-center">
        <p className="font-extrabold text-gray-900 text-lg mb-2">
          Still have questions?
        </p>
        <p className="text-gray-500 text-sm mb-5">
          Send us a message and we'll get back to you.
        </p>
        <Link href="/contact" className="btn-primary py-2 px-5 flex gap-x-2 justify-center items-center w-fit">
          Contact Us <ArrowRight className="h-4 w-4"/>
        </Link>
      </div>
    </div>
  );
}