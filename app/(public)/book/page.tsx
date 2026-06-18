"use client";
import Link from "next/link";
import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Video, Audio, Calendar, Cycle, ArrowRight, ArrowLeft } from "@/components/icons"

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

type Step = "type" | "datetime" | "details" | "confirm" | "success";

export default function BookPage() {
  const [step, setStep] = useState<Step>("type");
  const [sessionFormat, setSessionFormat] = useState<"SINGLE" | "RECURRING">("SINGLE");
  const [sessionType, setSessionType] = useState<"VIDEO" | "AUDIO">("VIDEO");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [frequency, setFrequency] = useState<"WEEKLY" | "BIWEEKLY" | "MONTHLY">("WEEKLY");
  const [endDate, setEndDate] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [manageToken, setManageToken] = useState("");
  const [error, setError] = useState("");

  const today = format(startOfDay(new Date()), "yyyy-MM-dd");

  async function fetchSlots(date: string) {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/bookings?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedSlot || !form.name || !form.email) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        sessionType,
        reasonForSession: form.reason || undefined,
      };

      if (sessionFormat === "RECURRING") {
        body.frequency = frequency;
        body.endDate = endDate;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setManageToken(data.manageToken);
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter min-h-screen bg-brand-smoke py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-xl md:text-2xl text-brand-coral">Book a Session</h1>
          <p className="text-sm md:text-[15px] max-w-lg mx-auto">
            Free, confidential, and online. No account required.
          </p>
        </div>

        {/* Progress */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["type", "datetime", "details", "confirm"] as Step[]).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s
                        ? "bg-brand-cherry text-white"
                        : ["type", "datetime", "details", "confirm"].indexOf(
                            step
                          ) >
                          ["type", "datetime", "details", "confirm"].indexOf(s)
                        ? "bg-brand-cherry/20 text-brand-cherry"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-8 h-px bg-gray-300" />}
                </div>
              )
            )}
          </div>
        )}

        <div className="card">
          {/* ── Step 1: Session Type ── */}
          {step === "type" && (
            <div>
              <label className="label">  What kind of session?</label>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {(["SINGLE", "RECURRING"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSessionFormat(f)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      sessionFormat === f
                        ? "border-brand-cherry bg-brand-cherry/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {f === "SINGLE" ? <Calendar className="w-4 h-4"/> : <Cycle className="w-4 h-4"/>}
                    </div>
                    <p className="font-extrabold text-gray-900 text-sm">
                      {f === "SINGLE" ? "Single Session" : "Recurring"}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {f === "SINGLE"
                        ? "One-time counseling session"
                        : "Weekly, bi-weekly, or monthly"}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="label">Session format</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["VIDEO", "AUDIO"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSessionType(t)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        sessionType === t
                          ? "border-brand-cherry bg-brand-cherry/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span>{t === "VIDEO" ? <Video className="w-4 h-4"/> : <Audio className="w-4 h-4"/>}</span>
                      <span className="font-bold text-gray-800 text-sm">
                        {t === "VIDEO" ? "Video Call" : "Audio Only"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {sessionFormat === "RECURRING" && (
                <div className="mb-6 p-4 bg-brand-smoke rounded-xl">
                  <label className="label">Frequency</label>
                  <select
                    className="input-field"
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(
                        e.target.value as "WEEKLY" | "BIWEEKLY" | "MONTHLY"
                      )
                    }
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  <label className="label mt-4">End date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    min={addDays(new Date(), 7).toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}

              <button
                onClick={() => setStep("datetime")}
                className="btn-primary flex items-center justify-center gap-x-2 w-full py-2 px-5"
              >
                Continue <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          )}

          {/* ── Step 2: Date & Time ── */}
          {step === "datetime" && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">
                Pick a date & time
              </h2>
              <div className="mb-5">
                <label className="label">
                  {sessionFormat === "RECURRING" ? "Start date" : "Date"}
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) fetchSlots(e.target.value);
                  }}
                />
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <label className="label">Available time slots (WAT)</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
                      No slots available on this date. Please try another day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                            !slot.available
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : selectedSlot?.startTime === slot.startTime
                              ? "bg-brand-cherry text-white shadow-cherry"
                              : "bg-brand-smoke text-gray-700 hover:bg-brand-cherry/10 hover:text-brand-cherry"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
 
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("type")}
                  className="btn-secondary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5"
                >
                  <ArrowLeft className="w-4 h-4"/> Back
                </button>
                <button
                  onClick={() => setStep("details")}
                  disabled={!selectedDate || !selectedSlot}
                  className="btn-primary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Details ── */}
          {step === "details" && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">
                Your details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    className="input-field"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
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
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your meeting link and reminders will be sent here.
                  </p>
                </div>
                <div>
                  <label className="label">Phone Number (optional)</label>
                  <input
                    className="input-field"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">
                    What would you like to talk about? (optional)
                  </label>
                  <textarea
                    className="input-field min-h-[90px] resize-none"
                    placeholder="You can share as much or as little as you'd like…"
                    value={form.reason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Your information is kept strictly confidential and will never be
                shared with third parties. See our{" "}
                <a href="/privacy" className="text-brand-cherry underline">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => setStep("datetime")}
                  className="btn-secondary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5"
                >
                  <ArrowLeft className="w-4 h-4"/> Back
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!form.name || !form.email}
                  className="btn-primary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === "confirm" && (
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">
                Confirm your booking
              </h2>

              <div className="bg-brand-smoke rounded-2xl p-5 space-y-3 mb-6">
                {[
                  { label: "Name", value: form.name },
                  { label: "Email", value: form.email },
                  {
                    label: "Date",
                    value: selectedDate
                      ? format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")
                      : "",
                  },
                  {
                    label: "Time",
                    value: selectedSlot
                      ? `${selectedSlot.startTime} – ${selectedSlot.endTime} (WAT)`
                      : "",
                  },
                  {
                    label: "Format",
                    value: `${sessionType === "VIDEO" ? "Video" : "Audio"} · ${
                      sessionFormat === "SINGLE" ? "Single session" : frequency.toLowerCase()
                    }`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">
                      {row.label}
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                By booking, you agree to our cancellation policy: sessions must
                be cancelled at least 24 hours in advance.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  disabled={loading}
                  className="btn-secondary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5"
                >
                  <ArrowLeft className="w-4 h-4"/> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
               
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   </span>
                  ) : (
                    "Confirm Booking ✓"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">
                You're all booked!
              </h2>
              <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                A confirmation email with your Google Meet link has been sent to{" "}
                <strong>{form.email}</strong>. You'll also receive reminders 24
                hours and 1 hour before your session.
              </p>
              <div className="mt-6 p-4 bg-brand-smoke rounded-xl text-left">
                <p className="text-xs text-gray-500 font-semibold mb-1">
                  Manage your appointment
                </p>
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL || ""}/manage/${manageToken}`} className="text-sm text-brand-cherry font-bold break-all hover:underline">
                  {`${process.env.NEXT_PUBLIC_APP_URL || ""}/manage/${manageToken}`}
                </Link>
              </div>
              <a
                href={`/manage/${manageToken}`}
                className="btn-primary mt-6 flex-1 flex items-center justify-center gap-x-2 w-full py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Appointment <ArrowRight className="w-4 h-4"/>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}