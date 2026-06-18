import { prisma } from "./prisma";
import { format, parse, addMinutes, isBefore, isEqual } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Africa/Lagos";
const SESSION_DURATION = 60; // minutes
const SLOT_INTERVAL = 60; // minutes

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function generateSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const baseDate = new Date(2000, 0, 1);
  let current = parse(startTime, "HH:mm", baseDate);
  const end = parse(endTime, "HH:mm", baseDate);

  while (isBefore(current, end) || isEqual(current, end)) {
    const slotEnd = addMinutes(current, SESSION_DURATION);
    if (!isBefore(end, slotEnd)) {
      slots.push(format(current, "HH:mm"));
    }
    current = addMinutes(current, SLOT_INTERVAL);
  }
  return slots;
}

export async function getAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay();

  // Check if date is blocked
  const blocked = await prisma.blockedDate.findUnique({
    where: { date: date },
  });
  if (blocked) return [];

  // Get working hours for this day
  const workingHours = await prisma.workingHours.findUnique({
    where: { dayOfWeek },
  });
  if (!workingHours || !workingHours.isActive) return [];

  // Generate all possible slots
  const allSlots = generateSlots(workingHours.startTime, workingHours.endTime);

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      date: date,
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(existingBookings.map((b) => b.startTime));

  return allSlots.map((slot) => ({
    startTime: slot,
    endTime: format(
      addMinutes(parse(slot, "HH:mm", new Date(2000, 0, 1)), SESSION_DURATION),
      "HH:mm"
    ),
    available: !bookedTimes.has(slot),
  }));
}

export async function isSlotAvailable(
  dateStr: string,
  startTime: string
): Promise<boolean> {
  const slots = await getAvailableSlots(dateStr);
  const slot = slots.find((s) => s.startTime === startTime);
  return slot?.available ?? false;
}