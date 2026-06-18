import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import {
//   deleteCalendarEvent,
//   updateCalendarEvent,
// } from "@/lib/google-calendar";
import { sendCounselorNotification, sendBookingConfirmation } from "@/lib/email";
import { isSlotAvailable } from "@/lib/availability";
import { rescheduleSchema } from "@/lib/validations";
import { format, differenceInHours } from "date-fns";

// GET — fetch booking by token
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }>}
) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { booker: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

// PATCH — reschedule
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { booker: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
    return NextResponse.json(
      { error: "Cannot reschedule this booking." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { date, startTime } = parsed.data;
  const [h, m] = startTime.split(":").map(Number);
  const endTime = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const available = await isSlotAvailable(date, startTime);
  if (!available) {
    return NextResponse.json(
      { error: "This slot is no longer available." },
      { status: 409 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      date: new Date(date + "T00:00:00"),
      startTime,
      endTime,
      status: "CONFIRMED",
    },
    include: { booker: true },
  });

  await sendCounselorNotification({
    type: "rescheduled",
    clientName: booking.booker.name,
    clientEmail: booking.booker.email,
    date,
    startTime,
    endTime,
  });

  return NextResponse.json({ success: true, booking: updated });
}

// DELETE — cancel
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { booker: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
    return NextResponse.json(
      { error: "Cannot cancel this booking." },
      { status: 400 }
    );
  }

  const now = new Date();
  const sessionDateTime = new Date(`${format(booking.date, "yyyy-MM-dd")}T${booking.startTime}:00`);
  const hoursLeft = differenceInHours(sessionDateTime, now);
  if (hoursLeft < 24) {
    return NextResponse.json(
      { error: "Cancellations must be made at least 24 hours before the session." },
      { status: 400 }
    );
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  await sendCounselorNotification({
    type: "cancelled",
    clientName: booking.booker.name,
    clientEmail: booking.booker.email,
    date: format(booking.date, "yyyy-MM-dd"),
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  return NextResponse.json({ success: true });
}


//this is fully function for when the site is sold or inuse for real services
// // PATCH — reschedule
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ token: string }>}
// ) {
//   const { token } = await params;
//   const booking = await prisma.booking.findUnique({
//     where: { manageToken: token },
//     include: { booker: true },
//   });

//   if (!booking) {
//     return NextResponse.json({ error: "Booking not found" }, { status: 404 });
//   }

//   if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
//     return NextResponse.json(
//       { error: "Cannot reschedule this booking." },
//       { status: 400 }
//     );
//   }

//   const body = await req.json();
//   const parsed = rescheduleSchema.safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json({ error: "Invalid data" }, { status: 400 });
//   }

//   const { date, startTime } = parsed.data;
//   const [h, m] = startTime.split(":").map(Number);
//   const endTime = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

//   const available = await isSlotAvailable(date, startTime);
//   if (!available) {
//     return NextResponse.json(
//       { error: "This slot is no longer available." },
//       { status: 409 }
//     );
//   }

//   // Update Google Calendar
//   if (booking.calendarEventId) {
//     await updateCalendarEvent(booking.calendarEventId, {
//       date,
//       startTime,
//       endTime,
//     });
//   }

//   const updated = await prisma.booking.update({
//     where: { id: booking.id },
//     data: {
//       date: new Date(date + "T00:00:00"),
//       startTime,
//       endTime,
//       status: "CONFIRMED",
//     },
//   });

//   await sendCounselorNotification({
//     type: "rescheduled",
//     clientName: booking.booker.name,
//     clientEmail: booking.booker.email,
//     date,
//     startTime,
//     endTime,
//   });

//   return NextResponse.json({ success: true, booking: updated });
// }

// // DELETE — cancel
// export async function DELETE(
//   _req: NextRequest,
//   { params }: { params: Promise<{ token: string }>}
// ) {
//   const { token } = await params;
//   const booking = await prisma.booking.findUnique({
//     where: { manageToken: token },
//     include: { booker: true },
//   });

//   if (!booking) {
//     return NextResponse.json({ error: "Booking not found" }, { status: 404 });
//   }

//   if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
//     return NextResponse.json(
//       { error: "Cannot cancel this booking." },
//       { status: 400 }
//     );
//   }

//   // Check 24-hour policy
//   const now = new Date();
//   const sessionDateTime = new Date(
//     `${format(booking.date, "yyyy-MM-dd")}T${booking.startTime}:00`
//   );
//   const hoursLeft = differenceInHours(sessionDateTime, now);
//   if (hoursLeft < 24) {
//     return NextResponse.json(
//       { error: "Cancellations must be made at least 24 hours before the session." },
//       { status: 400 }
//     );
//   }

//   // Remove from Google Calendar
//   if (booking.calendarEventId) {
//     await deleteCalendarEvent(booking.calendarEventId).catch(console.error);
//   }

//   await prisma.booking.update({
//     where: { id: booking.id },
//     data: { status: "CANCELLED" },
//   });

//   await sendCounselorNotification({
//     type: "cancelled",
//     clientName: booking.booker.name,
//     clientEmail: booking.booker.email,
//     date: format(booking.date, "yyyy-MM-dd"),
//     startTime: booking.startTime,
//     endTime: booking.endTime,
//   });

//   return NextResponse.json({ success: true });
// }