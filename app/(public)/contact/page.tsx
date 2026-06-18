"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter max-w-3xl mx-auto md:px-6 px-4 py-16">
      {/* Header */}
      <div className="text-center md:mb-14 mb-8">
        <h1 className="text-xl md:text-2xl text-brand-coral">Contact Us</h1>
        <p className="text-sm md:text-[15px] max-w-lg mx-auto">
          Have a question, need more information, or just want to reach out?
          We'd love to hear from you.
        </p>
      </div>

        {/* ── Form ────────────────────────── */}
        <div>
          {success ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                Thank you for reaching out. We'll get back to you within 24-48
                hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="btn-secondary mt-6 text-sm py-2 px-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="card">

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    className="input-field"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea
                    className="input-field min-h-[140px] resize-none"
                    placeholder="Write your message here…"
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                    minLength={10}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2 px-5 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We aim to respond to all messages within 24 - 48 hours on working days.
                  By submitting, you agree to our{" "}
                  <Link href="/privacy" className="text-brand-cherry underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          )}
        </div>
    </div>
  );
}