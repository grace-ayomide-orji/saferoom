import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { HourGlass, Stats, Calendar, Heart, Clock, ClipBoard } from "@/components/icons";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const now = new Date();

  const [
    totalBookings,
    upcomingCount,
    todayBookings,
    totalDonations,
    monthDonations,
    recentBookings,
    statusBreakdown,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: { status: "CONFIRMED", date: { gte: startOfDay(now) } },
    }),
    prisma.booking.findMany({
      where: {
        date: { gte: startOfDay(now), lte: endOfDay(now) },
        status: { notIn: ["CANCELLED"] },
      },
      include: { booker: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { booker: true },
    }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  return {
    totalBookings,
    upcomingCount,
    todayBookings,
    totalDonations,
    monthDonations,
    recentBookings,
    statusBreakdown,
  };
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  NO_SHOW: "bg-gray-100 text-gray-500",
  RESCHEDULED: "bg-purple-100 text-purple-700",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    {
      label: "Total Bookings",
      value: data.totalBookings,
      icon: Calendar,
      sub: "All time",
    },
    {
      label: "Upcoming Sessions",
      value: data.upcomingCount,
      icon: HourGlass,
      sub: "From today",
    },
    {
      label: "Total Donations",
      value: `$${Number(data.totalDonations._sum.amount ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`,
      icon: Heart,
      sub: `${data.totalDonations._count} donors`,
    },
    {
      label: "This Month",
      value: `$${Number(data.monthDonations._sum.amount ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}`,
      icon: Stats,
      sub: "Donations",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span></span>
        <a href="/book" target="_blank" className="btn-primary text-sm py-2 px-4">
          + New Booking
        </a>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card hover:shadow-cherry transition-all">
            <div className="flex items-center justify-between gap-x-2 mb-3">
              <p className="text-sm font-bold text-gray-600">{stat.label}</p>
              <span className="text-brand-coral"><stat.icon className="w-4 h-4"/></span>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's sessions */}
        <div className="card">
          <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-coral"/> Today's Sessions
          </h2>
          {data.todayBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm font-semibold">No sessions today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 bg-brand-smoke rounded-xl"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      {b.booker.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.startTime} – {b.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.status}
                    </span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="card">
          <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <ClipBoard className="w-4 h-4 text-brand-coral"/> Recent Bookings
          </h2>
          {data.recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm font-semibold">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 bg-brand-smoke rounded-xl"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      {b.booker.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(b.date), "MMM d, yyyy")} · {b.startTime}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      STATUS_BADGE[b.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
              <a
                href="/admin/appointments"
                className="block text-center text-xs font-bold text-brand-cherry mt-4 hover:underline"
              >
                View all appointments
              </a>
            </div>
          )}
          
        </div>
      </div>

      {/* Status breakdown */}
      {data.statusBreakdown.length > 0 && (
        <div className="card">
          <h2 className="font-extrabold text-gray-800 mb-4">
            Booking Status Breakdown
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.statusBreakdown.map((s) => (
              <div
                key={s.status}
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  STATUS_BADGE[s.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {s.status} · {s._count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}