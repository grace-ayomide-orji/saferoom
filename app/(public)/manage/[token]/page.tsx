"use client";
import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "@/components/icons";


interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  status: string;
  meetLink: string;
  booker: { name: string; email: string };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"view" | "reschedule" | "cancelled">("view");

  // Reschedule state
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/manage/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.booking) setBooking(d.booking);
        else setError("Appointment not found.");
      })
      .catch(() => setError("Failed to load appointment."))
      .finally(() => setLoading(false));
  }, [token]);

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

  async function handleCancel() {
    try{
      if (!confirm("Are you sure you want to cancel this appointment?")) return;
      setActionLoading(true);
      setActionError("");

      const res = await fetch(`/api/bookings/manage/${token}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setAction("cancelled");
        setBooking((b) => b && { ...b, status: "CANCELLED" });
      } else {
        setActionError(data.error || "Could not cancel appointment.");
      }
    }catch(error){
      setActionError(error instanceof Error && error.message || "Could not cancel appointment.");
    }finally{
      setActionLoading(false);
    }
  }

  async function handleReschedule() {
    if (!selectedSlot) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess(false)
    try{
      const res = await fetch(`/api/bookings/manage/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, startTime: selectedSlot.startTime }),
      });
      const data = await res.json();

      if (res.ok) {
        setBooking(data.booking);
        setAction("view");
        setActionSuccess(true)
      } else {
        setActionError(data.error || "Could not reschedule.");
        setActionSuccess(false)
      }
    } catch(error){
      setActionSuccess(false)
      setActionError(error instanceof Error && error.message || "Could not reshedule appointment.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Appointment not found
        </h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/book" className="btn-primary py-2 px-2">
          Book a New Session
        </Link>
      </div>
    );
  }

  const dateFormatted = format(new Date(booking.date), "EEEE, MMMM d, yyyy");
  const isCancelled = booking.status === "CANCELLED";
  const isCompleted = ["COMPLETED", "NO_SHOW"].includes(booking.status);

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    NO_SHOW: "bg-gray-100 text-gray-500",
    RESCHEDULED: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="page-enter min-h-screen bg-brand-smoke py-12 px-4">
      <div className="max-w-lg mx-auto">

        <div className="text-center md:mb-14 mb-8">
          <h1 className="text-xl md:text-2xl text-brand-coral">Your Appointment</h1>
          <p className="text-sm md:text-[15px] max-w-lg mx-auto">
            Have a question, need more information, or just want to reach out?
            We'd love to hear from you.
          </p>
        </div>

        <div className="card mb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-gray-900">Session Details</h2>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                statusColors[booking.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: "Name", value: booking.booker.name },
              { label: "Date", value: dateFormatted },
              {
                label: "Time",
                value: `${booking.startTime} – ${booking.endTime} (WAT)`,
              },
              { label: "Format", value: booking.sessionType },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold">{row.label}</span>
                <span className="font-bold text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>

          {booking.meetLink && booking.status === "CONFIRMED" && (
            <a
              href={booking.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex justify-center items-center gap-2 text-center mt-5 block p-2"
            >
              Join Google Meet <ArrowRight className="h-4 w-4"/>
            </a>
          )}

        </div>

        {/* Actions */}
        {!isCancelled && !isCompleted && action === "view" && (
          <div className="card">
            <h3 className="font-extrabold text-gray-900 mb-4">Manage</h3>
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                {actionError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setAction("reschedule")}
                className="btn-secondary flex-1 text-sm"
              >
                Reschedule
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 bg-red-50 border-2 border-red-200 text-red-600 font-bold px-4 py-3 rounded-xl hover:bg-red-100 transition-all text-sm disabled:opacity-50"
              >
                {actionLoading ? "Cancelling…" : "Cancel"}
              </button>
            </div>
              
            {actionSuccess && 
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm my-3">
                Successfully rescheduled! The updated meeting link has been sent to your email.
              </div>
            }
            <p className="text-xs text-gray-400 mt-3">
              Cancellations must be made at least 24 hours before the session.
            </p>
          </div>
        )}

        {action === "reschedule" && (
          <div className="card">
            <h3 className="font-extrabold text-gray-900 mb-4">
              Reschedule Session
            </h3>
            <div className="mb-4">
              <label className="label">New date</label>
              <input
                type="date"
                className="input-field"
                value={newDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  if (e.target.value) fetchSlots(e.target.value);
                }}
              />
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
              </div>
            ) : newDate && slots.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
                No slots available on this date. Please try another day.
              </div>
            ) : slots.length > 0 && (
              <div className="mb-4">
                <label className="label">Available times</label>
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
                          ? "bg-brand-cherry text-white"
                          : "bg-brand-smoke text-gray-700 hover:bg-brand-cherry/10"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {actionError}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setAction("view")}
                className="btn-secondary flex-1 p-2 text-sm flex justify-center items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4"/> Back
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedSlot || actionLoading}
                className="btn-primary p-2 flex-1 text-sm disabled:opacity-50"
              >
                {actionLoading ? "Saving…" : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        )}

        {(isCancelled || action === "cancelled") && (
          <div className="card text-center">
            <div className="text-3xl mb-3">❌</div>
            <p className="font-extrabold text-gray-900 mb-2">
              Appointment Cancelled
            </p>
            <p className="text-gray-500 text-sm mb-5">
              Your session has been cancelled.
            </p>
            <Link href="/book" className="btn-primary text-sm">
              Book a New Session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}