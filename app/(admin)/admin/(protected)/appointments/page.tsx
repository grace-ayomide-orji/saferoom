"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  sessionFormat: string;
  status: string;
  meetLink?: string;
  notes?: string;
  booker: { name: string; email: string; phone?: string };
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  NO_SHOW: "bg-gray-100 text-gray-500",
  RESCHEDULED: "bg-purple-100 text-purple-700",
};

const STATUSES = ["", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");

  async function fetchBookings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterDate) params.set("date", filterDate);
    params.set("limit", "50");

    const res = await fetch(`/api/admin/appointments?${params}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => { fetchBookings(); }, [filterStatus, filterDate]);

  async function updateStatus(id: string, status: string, noteText?: string) {
    setActionLoading(true);
    const res = await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes: noteText }),
    });
    if (res.ok) {
      fetchBookings();
      setSelected(null);
    }
    setActionLoading(false);
  }

  return (
    <div className="max-w-6xl space-y-6">
   
      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          className="input-field max-w-[180px] py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || "All statuses"}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-field max-w-[180px] py-2"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {(filterStatus || filterDate) && (
          <button
            onClick={() => { setFilterStatus(""); setFilterDate(""); }}
            className="btn-primary text-xs px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-smoke border-b border-gray-100">
                <tr>
                  {["Client", "Date & Time", "Type", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-smoke/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{b.booker.name}</p>
                      <p className="text-gray-400 text-xs">{b.booker.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {format(new Date(b.date + "T00:00:00"), "MMM d, yyyy")}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {b.startTime} – {b.endTime}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-gray-600">
                        {b.sessionType} · {b.sessionFormat}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {b.meetLink && (
                          <a
                            href={b.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-brand-cherry hover:underline"
                          >
                            Join
                          </a>
                        )}
                        <button
                          onClick={() => { setSelected(b); setNotes(b.notes || ""); }}
                          className="text-xs font-bold text-gray-500 hover:text-brand-cherry transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-cherry-lg w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-gray-900">Manage Appointment</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="bg-brand-smoke rounded-xl p-4 space-y-2 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Client</span>
                <span className="font-bold">{selected.booker.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Date</span>
                <span className="font-bold">{format(new Date(selected.date + "T00:00:00"), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Time</span>
                <span className="font-bold">{selected.startTime} – {selected.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="label">Admin Notes (private)</label>
              <textarea
                className="input-field min-h-[80px] resize-none text-sm"
                placeholder="Add private notes about this session…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Status actions */}
            <div className="space-y-2">
              {selected.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() => updateStatus(selected.id, "COMPLETED", notes)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    ✓ Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "NO_SHOW", notes)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-all disabled:opacity-50"
                  >
                    No Show
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "CANCELLED", notes)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    Cancel Session
                  </button>
                </>
              )}
              {notes !== selected.notes && (
                <button
                  onClick={() => updateStatus(selected.id, selected.status, notes)}
                  disabled={actionLoading}
                  className="w-full py-2.5 border-2 border-brand-cherry text-brand-cherry rounded-xl font-bold text-sm hover:bg-brand-cherry/5 transition-all disabled:opacity-50"
                >
                  Save Notes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}