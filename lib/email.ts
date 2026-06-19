import nodemailer from "nodemailer";
import { format } from "date-fns";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM = process.env.EMAIL_FROM || "Safe Room <noreply@saferoom.com>";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Safe Room</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Nunito',sans-serif; background:#f2f2f2; color:#1a1a1a; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(109,15,21,0.1); }
    .header { background:#68764B; padding:32px 20px; text-align:center; }
    .header h1 { color:#fff; font-size:24px; font-weight:800; }
    .body { padding:40px 20px; }
    .detail-card { background:#F4F4F4; border-radius:12px; padding:20px 10px; margin:24px 0; }
    .detail-row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; border-bottom:1px solid #e5e5e5; }
    .detail-row:last-child { border:none; }
    .detail-label { color:#666; font-weight:600; margin-right:5px; }
    .detail-value { color:#1a1a1a; font-weight:700; }
    .btn { display:inline-block; background:#68764B; color:#fff; text-decoration:none; padding:14px; border-radius:10px; font-weight:700; font-size:15px; margin:8px 4px; }
    .btn-outline { background:transparent; border:2px solid #68764B; color:#68764B; }
    .btn-coral { background:#E27C82; }
    .footer { background:#F2F2F2; padding:24px 20px; text-align:center; font-size:12px; color:#999; }
    .footer a { color:#68764B; }
    p { font-size:15px; line-height:1.7; color:#444; margin-bottom:12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Save Room</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>This email was sent by Safe Room &mdash; <a href="${APP_URL}">${APP_URL}</a></p>
      <p style="margin-top:4px">© ${new Date().getFullYear()} Safe Room. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Booking confirmation to client ──────────────────────
export async function sendBookingConfirmation(params: {
  clientName: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  meetLink: string;
  manageToken: string;
  isDemo?: boolean;
}) {
  const manageUrl = `${APP_URL}/manage/${params.manageToken}`;
  const dateFormatted = format(new Date(params.date), "EEEE, MMMM d, yyyy");

  const html = baseTemplate(`
    <p>Hi <strong>${params.clientName}</strong>,</p>
    <p>Your counseling session has been successfully booked. We look forward to speaking with you.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${dateFormatted}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${params.startTime} – ${params.endTime} (WAT)</span></div>
      <div class="detail-row"><span class="detail-label">Format</span><span class="detail-value">${params.sessionType}</span></div>
      <div class="detail-row"><span class="detail-label">Meeting Link</span><span class="detail-value"><a href="${params.meetLink}" style="color:#68764B">${params.meetLink}</a></span></div>
    </div>
    <p style="text-align:center; margin-top:28px">
      <a href="${params.meetLink}" class="btn">Join Meeting</a>
      <a href="${manageUrl}" class="btn btn-outline">Manage Appointment</a>
    </p>
    ${params.isDemo ? `
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#92400e;font-weight:600;">
      🚧 This is a demo booking. The meeting link below is not a real session.
    </div>` : ""}
    <p style="margin-top:24px">To reschedule or cancel your appointment, use your secure management link above. Please note you can only cancel up to 24 hours before your session.</p>
    <p>God bless,<br/><strong>Safe Room</strong></p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: params.clientEmail,
    subject: `Session Confirmed - ${dateFormatted}`,
    html,
  });
}

// ── Counselor notification ───────────────────────────────
export async function sendCounselorNotification(params: {
  type: "created" | "cancelled" | "rescheduled";
  clientName: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  const counselorEmail = process.env.ADMIN_EMAIL!;
  const dateFormatted = format(new Date(params.date), "EEEE, MMMM d, yyyy");
  const labels = {
    created: "New Booking",
    cancelled: "Booking Cancelled",
    rescheduled: "Booking Rescheduled",
  };

  const html = baseTemplate(`
    <p><strong>${labels[params.type]}:</strong> ${params.clientName}</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Client</span><span class="detail-value">${params.clientName}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${params.clientEmail}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${dateFormatted}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${params.startTime} – ${params.endTime} (WAT)</span></div>
      ${params.reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${params.reason}</span></div>` : ""}
    </div>
    <p style="text-align:center"><a href="${APP_URL}/admin/appointments" class="btn">View in Dashboard</a></p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: counselorEmail,
    subject: `[Admin] ${labels[params.type]} — ${params.clientName}`,
    html,
  });
}

// ── Reminder emails ──────────────────────────────────────
export async function sendReminderEmail(params: {
  clientName: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  manageToken: string;
  hoursUntil: 24 | 1;
}) {
  const manageUrl = `${APP_URL}/manage/${params.manageToken}`;
  const dateFormatted = format(new Date(params.date), "EEEE, MMMM d, yyyy");
  const label = params.hoursUntil === 24 ? "Tomorrow" : "In 1 Hour";

  const html = baseTemplate(`
    <p>Hi <strong>${params.clientName}</strong>,</p>
    <p>This is a reminder that your counseling session is <strong>${label}</strong>.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${dateFormatted}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${params.startTime} – ${params.endTime} (WAT)</span></div>
      <div class="detail-row"><span class="detail-label">Meeting Link</span><span class="detail-value"><a href="${params.meetLink}" style="color:#68764B">${params.meetLink}</a></span></div>
    </div>
    <p style="text-align:center; margin-top:28px">
      <a href="${params.meetLink}" class="btn">Join Meeting</a>
      <a href="${manageUrl}" class="btn btn-outline">Manage Appointment</a>
    </p>
    <p>See you soon.<br/><strong>Safe Room</strong></p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: params.clientEmail,
    subject: `Session Reminder (${label}) - ${dateFormatted}`,
    html,
  });
}

// ── Donation receipt ─────────────────────────────────────
export async function sendDonationReceipt(params: {
  name: string;
  email: string;
  amount: string;
  currency: string;
  reference: string;
  isDemo?: boolean;
}) {
  const html = baseTemplate(`
    <p>Dear <strong>${params.name}</strong>,</p>
    <p>Thank you so much for your generous donation. Your support means the world and helps us continue providing free counseling services.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${params.currency} ${params.amount}</span></div>
      <div class="detail-row"><span class="detail-label">Reference</span><span class="detail-value">${params.reference}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${format(new Date(), "MMMM d, yyyy")}</span></div>
    </div>
    <p>Your kindness is deeply appreciated. May God richly bless you.</p>
    <p>With gratitude,<br/><strong>Save Room team</strong></p>
    ${params.isDemo ? `
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#92400e;font-weight:600;">
      🚧 This is a demo booking. The meeting link below is not a real session.
    </div>` : ""}
    
  `);

  await transporter.sendMail({
    from: FROM,
    to: params.email,
    subject: `💙 Donation Received - Thank You, ${params.name}!`,
    html,
  });
}