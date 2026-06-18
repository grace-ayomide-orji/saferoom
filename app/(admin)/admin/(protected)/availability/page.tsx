"use client";
import { useEffect, useState } from "react";
import { Clock, Block, Check } from "@/components/icons";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WorkingHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
}

export default function AvailabilityPage() {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((r) => r.json())
      .then((d) => {
        setWorkingHours(d.workingHours || []);
        setBlockedDates(d.blockedDates || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveHours(day: WorkingHour) {
    setSaving(day.dayOfWeek);
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "working_hours",
        data: {
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          isActive: day.isActive,
        },
      }),
    });
    setSaving(null);
  }

  function updateDay(dayOfWeek: number, changes: Partial<WorkingHour>) {
    setWorkingHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...changes } : h))
    );
  }

  async function addBlockedDate() {
    if (!newBlockDate) return;
    setAddingBlock(true);
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "blocked_date",
        data: { date: newBlockDate, reason: newBlockReason || undefined },
      }),
    });
    const data = await res.json();
    if (data.blockedDate) {
      setBlockedDates((prev) => [...prev, data.blockedDate].sort((a, b) => a.date.localeCompare(b.date)));
      setNewBlockDate("");
      setNewBlockReason("");
    }
    setAddingBlock(false);
  }

  async function removeBlockedDate(id: string) {
    await fetch("/api/admin/availability", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBlockedDates((prev) => prev.filter((d) => d.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className=" space-y-6">
     
      <p className="text-gray-500 text-sm mt-0.5">
        Set your working hours and block dates when you're unavailable.
      </p>
  
      {/* Working Hours */}
      <div className="card">
        <h2 className="font-extrabold text-gray-900 text-base mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-coral"/> Working Hours{" "}
          <span className="text-xs font-semibold text-gray-400">(WAT, UTC+1)</span>
        </h2>

        <div className="space-y-3">
          {DAYS.map((dayName, i) => {
            const day = workingHours.find((h) => h.dayOfWeek === i);
            if (!day) return null;

            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  day.isActive ? "bg-brand-smoke" : "bg-gray-50 opacity-60"
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => {
                    const updated = { ...day, isActive: !day.isActive };
                    updateDay(i, { isActive: !day.isActive });
                    saveHours(updated);
                  }}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    day.isActive ? "bg-brand-cherry" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      day.isActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Day name */}
                <span
                  className={`w-24 text-sm font-bold flex-shrink-0 ${
                    day.isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {dayName}
                </span>

                {/* Time inputs */}
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    className="input-field py-1.5 text-sm max-w-[110px]"
                    value={day.startTime}
                    disabled={!day.isActive}
                    onChange={(e) => updateDay(i, { startTime: e.target.value })}
                  />
                  <span className="text-gray-400 font-semibold text-sm">to</span>
                  <input
                    type="time"
                    className="input-field py-1.5 text-sm max-w-[110px]"
                    value={day.endTime}
                    disabled={!day.isActive}
                    onChange={(e) => updateDay(i, { endTime: e.target.value })}
                  />
                </div>

                {/* Save btn */}
                <button
                  onClick={() => saveHours(day)}
                  disabled={saving === i}
                  className="text-xs font-bold text-brand-cherry hover:underline flex-shrink-0"
                >
                  {saving === i ? "Saving…" : "Save"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Sessions are 60 minutes long. Slots are generated automatically from
          your working hours with 60-minute intervals.
        </p>
      </div>

      {/* Blocked Dates */}
      <div className="card">
        <h2 className="font-extrabold text-gray-900 text-base mb-5 flex items-center gap-2">
          <Block className="w-4 h-4 text-brand-coral"/> Blocked Dates
        </h2>

        <div className="flex gap-3 mb-5">
          <input
            type="date"
            className="input-field flex-1 py-2"
            value={newBlockDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNewBlockDate(e.target.value)}
          />
          <input
            className="input-field flex-1 py-2"
            placeholder="Reason (optional)"
            value={newBlockReason}
            onChange={(e) => setNewBlockReason(e.target.value)}
          />
          <button
            onClick={addBlockedDate}
            disabled={addingBlock || !newBlockDate}
            className="btn-primary text-sm py-2 px-4 flex-shrink-0 disabled:opacity-50"
          >
            {addingBlock ? "Adding…" : "Block"}
          </button>
        </div>

        {blockedDates.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center py-8 text-gray-400">
            <p className="text-3xl mb-2 bg-green-100 text-green-900 w-fit p-2 rounded-full"><Check className="w-4 h-4"/></p>
            <p className="text-sm font-semibold">No blocked dates</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div
                key={bd.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
              >
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {new Date(bd.date + "T00:00:00").toLocaleDateString("en-NG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {bd.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{bd.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(bd.id)}
                  className="text-red-400 hover:text-red-600 font-bold text-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}