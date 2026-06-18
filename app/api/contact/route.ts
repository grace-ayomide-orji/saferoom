import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import nodemailer from "nodemailer";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 3) return true;

  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please fill in all fields correctly." },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Send email to Efe
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const FROM = process.env.EMAIL_FROM || "Speak with Efe <noreply@speakwithefe.com>";
    const counselorEmail = process.env.ADMIN_EMAIL!;

    // Notify Efe
    await transporter.sendMail({
      from: FROM,
      to: counselorEmail,
      replyTo: email,
      subject: `SafeRoom Contact Form - Message from ${name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background: #F4F4F4; color: #1a1a1a; margin:0; padding:0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(109,15,21,0.1); }
    .header { background: #68764B; padding: 28px 36px; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 800; margin: 0; }
    .body { padding: 36px; }
    .meta { background: #F4F4F4; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
    .meta-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; border-bottom: 1px solid #e5e5e5; }
    .meta-row:last-child { border: none; }
    .label { color: #666; font-weight: 600; }
    .value { color: #1a1a1a; font-weight: 700; }
    .message-box { background: #fff8f8; border-left: 4px solid #68764B; border-radius: 0 12px 12px 0; padding: 16px 20px; font-size: 15px; line-height: 1.7; color: #333; }
    .footer { background: #F4F4F4; padding: 20px 36px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Contact Message</h1>
    </div>
    <div class="body">
      <div class="meta">
        <div class="meta-row">
          <span class="label">From</span>
          <span class="value">${name}</span>
        </div>
        <div class="meta-row">
          <span class="label">Email</span>
          <span class="value"><a href="mailto:${email}" style="color:#68764B">${email}</a></span>
        </div>
        <div class="meta-row">
          <span class="label">Sent</span>
          <span class="value">${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} (WAT)</span>
        </div>
      </div>
      <p style="font-size:13px;font-weight:700;color:#666;margin-bottom:10px;">MESSAGE</p>
      <div class="message-box">${message.replace(/\n/g, "<br/>")}</div>
      <p style="margin-top:20px;font-size:13px;color:#999;">
        Reply directly to this email to respond to ${name}.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Safe Room
    </div>
  </div>
</body>
</html>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `We received your message - SafeRoom`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background: #F4F4F4; color: #1a1a1a; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(109,15,21,0.1); }
    .header { background: #68764B; padding: 28px 36px; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 800; margin: 0; }
    .header p { color: #E27C82; margin: 4px 0 0; font-size: 13px; }
    .body { padding: 36px; font-size: 15px; line-height: 1.7; color: #444; }
    .footer { background: #F4F4F4; padding: 20px 36px; text-align: center; font-size: 12px; color: #999; }
    a.btn { display:inline-block; background:#68764B; color:#fff; text-decoration:none; padding:12px 24px; border-radius:10px; font-weight:700; font-size:14px; margin-top:16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Message Received</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <p>
        Thank you for reaching out to Speak with Efe. We have received your 
        message and will get back to you within 24-48 hours.
      </p>
      <p>
        In the meantime, if you'd like to book a free counseling session, 
        you can do so directly below - no account required.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/book" class="btn">Book a Free Session</a>
      <p style="margin-top:24px;">
        God bless,<br/>
        <strong>The Save Room team</strong>
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Safe Room
    </div>
  </div>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}