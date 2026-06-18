import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendBookingConfirmation,
  sendCounselorNotification,
} from "@/lib/email";
import { isSlotAvailable, getAvailableSlots } from "@/lib/availability";
import { singleBookingSchema, recurringBookingSchema } from "@/lib/validations";
import { addWeeks, addMonths, format, parseISO } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO MODE — Google Calendar & Meet integration is disabled.
// Emails still send. Bookings are saved to the database.
// To go live: uncomment the Google Calendar import and swap the
// createCalendarEvent call back in below each "DEMO:" comment.
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_MEET_LINK = "https://meet.google.com/demo-safe-room";

function simulateCalendarEvent(name: string) {
  return {
    eventId: `demo-event-${Date.now()}`,
    meetLink: DEMO_MEET_LINK,
    htmlLink: DEMO_MEET_LINK,
  };
}

function getRecurringDates(
  startDate: string,
  endDate: string,
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
): string[] {
  const dates: string[] = [];
  let current = parseISO(startDate);
  const end = parseISO(endDate);

  while (current <= end) {
    dates.push(format(current, "yyyy-MM-dd"));
    if (frequency === "WEEKLY") current = addWeeks(current, 1);
    else if (frequency === "BIWEEKLY") current = addWeeks(current, 2);
    else current = addMonths(current, 1);
  }
  return dates;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isRecurring = body.frequency !== undefined;

    const schema = isRecurring ? recurringBookingSchema : singleBookingSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const [h, m] = data.startTime.split(":").map(Number);
    const endTime = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    let booker = await prisma.booker.findFirst({ where: { email: data.email } });
    if (!booker) {
      booker = await prisma.booker.create({
        data: { name: data.name, email: data.email, phone: data.phone },
      });
    }

    const createdBookings = [];

    if (!isRecurring) {
      const available = await isSlotAvailable(data.date, data.startTime);
      if (!available) {
        return NextResponse.json(
          { error: "This slot is no longer available." },
          { status: 409 }
        );
      }

      // DEMO: using simulated calendar event
      // LIVE: replace with → const calEvent = await createCalendarEvent({ ... })
      const calEvent = simulateCalendarEvent(data.name);

      const booking = await prisma.booking.create({
        data: {
          bookerId: booker.id,
          date: new Date(data.date + "T00:00:00"),
          startTime: data.startTime,
          endTime,
          sessionType: data.sessionType,
          sessionFormat: "SINGLE",
          status: "CONFIRMED",
          meetLink: calEvent.meetLink,
          calendarEventId: calEvent.eventId,
          reasonForSession: data.reasonForSession,
        },
      });

      await sendBookingConfirmation({
        clientName: data.name,
        clientEmail: data.email,
        date: data.date,
        startTime: data.startTime,
        endTime,
        sessionType: data.sessionType,
        meetLink: calEvent.meetLink,
        manageToken: booking.manageToken,
        isDemo: true,
      });

      await sendCounselorNotification({
        type: "created",
        clientName: data.name,
        clientEmail: data.email,
        date: data.date,
        startTime: data.startTime,
        endTime,
      });

      createdBookings.push(booking);
    } else {
      const recurringData = data as typeof data & {
        frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
        endDate: string;
      };

      const dates = getRecurringDates(
        data.date,
        recurringData.endDate,
        recurringData.frequency
      );

      const series = await prisma.recurringSeries.create({
        data: {
          frequency: recurringData.frequency,
          startDate: new Date(data.date + "T00:00:00"),
          endDate: new Date(recurringData.endDate + "T00:00:00"),
        },
      });

      for (const date of dates) {
        const available = await isSlotAvailable(date, data.startTime);
        if (!available) continue;

        // DEMO: using simulated calendar event
        // LIVE: replace with → const calEvent = await createCalendarEvent({ ... })
        const calEvent = simulateCalendarEvent(data.name);

        const booking = await prisma.booking.create({
          data: {
            bookerId: booker.id,
            date: new Date(date + "T00:00:00"),
            startTime: data.startTime,
            endTime,
            sessionType: data.sessionType,
            sessionFormat: "RECURRING",
            status: "CONFIRMED",
            meetLink: calEvent.meetLink,
            calendarEventId: calEvent.eventId,
            recurringSeriesId: series.id,
            reasonForSession: data.reasonForSession,
          },
        });

        createdBookings.push(booking);
      }

      if (createdBookings.length > 0) {
        const first = createdBookings[0];
        await sendBookingConfirmation({
          clientName: data.name,
          clientEmail: data.email,
          date: format(first.date, "yyyy-MM-dd"),
          startTime: first.startTime,
          endTime: first.endTime,
          sessionType: first.sessionType,
          meetLink: first.meetLink || "",
          manageToken: first.manageToken,
          isDemo: true,
        });

        await sendCounselorNotification({
          type: "created",
          clientName: data.name,
          clientEmail: data.email,
          date: format(first.date, "yyyy-MM-dd"),
          startTime: first.startTime,
          endTime: first.endTime,
        });
      }
    }

    return NextResponse.json({
      success: true,
      bookings: createdBookings.length,
      manageToken: createdBookings[0]?.manageToken,
    });
  } catch (error) {
    console.error("[POST /api/bookings]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }
  const slots = await getAvailableSlots(date);
  return NextResponse.json({ slots });
}


//this is fully function for when the site is sold or inuse for real services
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { createCalendarEvent } from "@/lib/google-calendar";
// import {
//   sendBookingConfirmation,
//   sendCounselorNotification,
// } from "@/lib/email";
// import { isSlotAvailable, getAvailableSlots } from "@/lib/availability";
// import { singleBookingSchema, recurringBookingSchema } from "@/lib/validations";
// import { addWeeks, addMonths, format, parseISO } from "date-fns";

// function getRecurringDates(
//   startDate: string,
//   endDate: string,
//   frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
// ): string[] {
//   const dates: string[] = [];
//   let current = parseISO(startDate);
//   const end = parseISO(endDate);

//   while (current <= end) {
//     dates.push(format(current, "yyyy-MM-dd"));
//     if (frequency === "WEEKLY") current = addWeeks(current, 1);
//     else if (frequency === "BIWEEKLY") current = addWeeks(current, 2);
//     else current = addMonths(current, 1);
//   }
//   return dates;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const isRecurring = body.frequency !== undefined;

//     // Validate
//     const schema = isRecurring ? recurringBookingSchema : singleBookingSchema;
//     const parsed = schema.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Validation failed", issues: parsed.error.issues },
//         { status: 400 }
//       );
//     }
//     const data = parsed.data;

//     // Determine session duration / endTime
//     const [h, m] = data.startTime.split(":").map(Number);
//     const endHour = h + 1;
//     const endTime = `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

//     // Find or create booker
//     let booker = await prisma.booker.findFirst({
//       where: { email: data.email },
//     });
//     if (!booker) {
//       booker = await prisma.booker.create({
//         data: { name: data.name, email: data.email, phone: data.phone },
//       });
//     }

//     const createdBookings = [];

//     if (!isRecurring) {
//       // ── Single booking ───────────────────────────────
//       const available = await isSlotAvailable(data.date, data.startTime);
//       if (!available) {
//         return NextResponse.json(
//           { error: "This slot is no longer available." },
//           { status: 409 }
//         );
//       }

//       // Create Google Meet + Calendar event
//       const calEvent = await createCalendarEvent({
//         title: `Counseling - ${data.name}`,
//         description: `Session with ${data.name} (${data.email})${data.reasonForSession ? `\n\nReason: ${data.reasonForSession}` : ""}`,
//         date: data.date,
//         startTime: data.startTime,
//         endTime,
//         clientEmail: data.email,
//         clientName: data.name,
//       });

//       const booking = await prisma.booking.create({
//         data: {
//           bookerId: booker.id,
//           date: new Date(data.date + "T00:00:00"),
//           startTime: data.startTime,
//           endTime,
//           sessionType: data.sessionType,
//           sessionFormat: "SINGLE",
//           status: "CONFIRMED",
//           meetLink: calEvent.meetLink,
//           calendarEventId: calEvent.eventId,
//           reasonForSession: data.reasonForSession,
//         },
//       });

//       // Send emails
//       await sendBookingConfirmation({
//         clientName: data.name,
//         clientEmail: data.email,
//         date: data.date,
//         startTime: data.startTime,
//         endTime,
//         sessionType: data.sessionType,
//         meetLink: calEvent.meetLink,
//         manageToken: booking.manageToken,
//       });

//       await sendCounselorNotification({
//         type: "created",
//         clientName: data.name,
//         clientEmail: data.email,
//         date: data.date,
//         startTime: data.startTime,
//         endTime,
//       });

//       createdBookings.push(booking);
//     } else {
//       // ── Recurring booking ────────────────────────────
//       const recurringData = data as typeof data & {
//         frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
//         endDate: string;
//       };

//       const dates = getRecurringDates(
//         data.date,
//         recurringData.endDate,
//         recurringData.frequency
//       );

//       // Create recurring series record
//       const series = await prisma.recurringSeries.create({
//         data: {
//           frequency: recurringData.frequency,
//           startDate: new Date(data.date + "T00:00:00"),
//           endDate: new Date(recurringData.endDate + "T00:00:00"),
//         },
//       });

//       for (const date of dates) {
//         const available = await isSlotAvailable(date, data.startTime);
//         if (!available) continue; // skip unavailable dates silently

//         const calEvent = await createCalendarEvent({
//           title: `Counseling — ${data.name}`,
//           description: `Recurring session with ${data.name}`,
//           date,
//           startTime: data.startTime,
//           endTime,
//           clientEmail: data.email,
//           clientName: data.name,
//         });

//         const booking = await prisma.booking.create({
//           data: {
//             bookerId: booker.id,
//             date: new Date(date + "T00:00:00"),
//             startTime: data.startTime,
//             endTime,
//             sessionType: data.sessionType,
//             sessionFormat: "RECURRING",
//             status: "CONFIRMED",
//             meetLink: calEvent.meetLink,
//             calendarEventId: calEvent.eventId,
//             recurringSeriesId: series.id,
//             reasonForSession: data.reasonForSession,
//           },
//         });

//         createdBookings.push(booking);
//       }

//       // Send confirmation for the first booking
//       if (createdBookings.length > 0) {
//         const first = createdBookings[0];
//         await sendBookingConfirmation({
//           clientName: data.name,
//           clientEmail: data.email,
//           date: format(first.date, "yyyy-MM-dd"),
//           startTime: first.startTime,
//           endTime: first.endTime,
//           sessionType: first.sessionType,
//           meetLink: first.meetLink || "",
//           manageToken: first.manageToken,
//         });

//         await sendCounselorNotification({
//           type: "created",
//           clientName: data.name,
//           clientEmail: data.email,
//           date: format(first.date, "yyyy-MM-dd"),
//           startTime: first.startTime,
//           endTime: first.endTime,
//         });
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       bookings: createdBookings.length,
//       manageToken: createdBookings[0]?.manageToken,
//     });
//   } catch (error) {
//     console.error("[POST /api/bookings]", error);
//     return NextResponse.json(
//       { error: "Something went wrong. Please try again." },
//       { status: 500 }
//     );
//   }
// }

// // GET available slots for a given date
// export async function GET(req: NextRequest) {
//   const date = req.nextUrl.searchParams.get("date");
//   if (!date) {
//     return NextResponse.json({ error: "date param required" }, { status: 400 });
//   }

//   const slots = await getAvailableSlots(date);
//   return NextResponse.json({ slots });
// }