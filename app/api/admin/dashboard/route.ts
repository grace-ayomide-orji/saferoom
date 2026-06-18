import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const [
    totalBookings,
    upcomingCount,
    todayBookings,
    totalDonations,
    monthDonations,
    recentBookings,
    recentDonations,
    statusBreakdown,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: { status: "CONFIRMED", date: { gte: now } },
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
      _count: true,
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { booker: true },
    }),
    prisma.donation.findMany({
      take: 5,
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalBookings,
      upcomingCount,
      totalDonationsAmount: totalDonations._sum.amount ?? 0,
      totalDonationsCount: totalDonations._count,
      monthDonationsAmount: monthDonations._sum.amount ?? 0,
      monthDonationsCount: monthDonations._count,
    },
    todayBookings,
    recentBookings,
    recentDonations,
    statusBreakdown,
  });
}