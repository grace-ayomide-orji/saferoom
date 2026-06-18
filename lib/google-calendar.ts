import { google } from "googleapis";

const TIMEZONE = "Africa/Lagos";

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

export interface CalendarEventInput {
  title: string;
  description: string;
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  clientEmail: string;
  clientName: string;
}

export interface CalendarEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<CalendarEventResult> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const startDateTime = `${input.date}T${input.startTime}:00`;
  const endDateTime = `${input.date}T${input.endTime}:00`;

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Counseling Session — ${input.clientName}`,
      description: input.description,
      start: {
        dateTime: startDateTime,
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: endDateTime,
        timeZone: TIMEZONE,
      },
      attendees: [
        { email: process.env.COUNSELOR_EMAIL!, organizer: true },
        { email: input.clientEmail, displayName: input.clientName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `swe-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    )?.uri || "";

  return {
    eventId: event.data.id!,
    meetLink,
    htmlLink: event.data.htmlLink || "",
  };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    eventId,
    sendUpdates: "all",
  });
}

export async function updateCalendarEvent(
  eventId: string,
  input: Partial<CalendarEventInput>
): Promise<void> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const patch: Record<string, unknown> = {};

  if (input.date && input.startTime && input.endTime) {
    patch.start = {
      dateTime: `${input.date}T${input.startTime}:00`,
      timeZone: TIMEZONE,
    };
    patch.end = {
      dateTime: `${input.date}T${input.endTime}:00`,
      timeZone: TIMEZONE,
    };
  }

  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    eventId,
    sendUpdates: "all",
    requestBody: patch,
  });
}