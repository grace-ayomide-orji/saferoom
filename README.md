# Speak with Efe
### Free Online Counseling & Donation Platform
**© Hepzibal Ideas**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Nunito font |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Payments | Stripe + Flutterwave |
| Email | Nodemailer (SMTP) |
| Scheduling | Google Calendar API |
| Meetings | Google Meet (via Calendar) |
| Hosting | Vercel |
| Auth | Custom session (bcrypt + cookies) |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx         # Home
│   │   ├── about/           # About Efe
│   │   ├── book/            # Booking flow (multi-step)
│   │   ├── manage/[token]/  # Client appointment management
│   │   ├── donate/          # Donation page + success
│   │   ├── contact/         # Contact form
│   │   ├── faq/             # FAQ accordion
│   │   └── privacy/         # Privacy policy
│   ├── (admin)/            # Admin dashboard (protected)
│   │   └── admin/
│   │       ├── login/       # Admin sign-in
│   │       ├── dashboard/   # Stats + today's sessions
│   │       ├── appointments/ # Manage all bookings
│   │       ├── availability/ # Working hours + blocked dates
│   │       ├── donations/   # Donation history
│   │       └── profile/     # Edit counselor profile
│   └── api/               # Route handlers
│       ├── bookings/        # Create + get slots
│       ├── bookings/manage/[token]/ # View / cancel / reschedule
│       ├── contact/         # Contact form email
│       ├── donations/       # Initiate payment
│       ├── auth/login/      # Admin login
│       ├── auth/logout/     # Admin logout
│       ├── admin/           # Protected admin routes
│       └── webhooks/        # Stripe + Flutterwave webhooks
├── lib/
│   ├── prisma.ts            # DB client
│   ├── auth.ts              # Session management
│   ├── availability.ts      # Slot generation logic
│   ├── google-calendar.ts   # Calendar + Meet integration
│   ├── email.ts             # All email templates
│   └── validations.ts       # Zod schemas
├── middleware.ts             # Admin route protection
└── styles/globals.css        # Brand styles + Nunito
prisma/
├── schema.prisma             # Full data model
└── seed.ts                   # Bootstrap DB
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd speak-with-efe
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up Google Calendar

See `GOOGLE_SETUP.md` for the full step-by-step guide.

### 4. Set up the database

```bash
# Create the database schema
npm run db:push

# Seed with default data (admin user + working hours)
npm run db:seed
```

Default admin credentials (change immediately after first login):
- Email: `admin@speakwithefe.com`
- Password: `changeme123!`

Or set `ADMIN_EMAIL` and `ADMIN_SEED_PASSWORD` in `.env.local` before seeding.

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

Admin dashboard: http://localhost:3000/admin/login

---

## Deployment (Vercel + Neon)

### Database (Neon)

1. Create a free account at https://neon.tech
2. Create a new project: `speak-with-efe`
3. Copy the connection string to `DATABASE_URL` in Vercel env vars

### App (Vercel)

1. Push to GitHub
2. Import the repo on https://vercel.com
3. Add all environment variables from `.env.example`
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

After deploy, run migrations:
```bash
npx prisma migrate deploy
```

### Webhooks

**Stripe:**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`, `checkout.session.expired`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

**Flutterwave:**
1. Go to Flutterwave Dashboard → Settings → Webhooks
2. Add URL: `https://yourdomain.com/api/webhooks/flutterwave`
3. Set a secret hash and add it to `FLUTTERWAVE_WEBHOOK_SECRET`

---

## Key Features

- ✅ No user accounts required — bookings managed via secure token URLs
- ✅ Single + recurring sessions (weekly / bi-weekly / monthly)
- ✅ Google Calendar + Meet auto-generated per booking
- ✅ Email confirmations, counselor notifications, reminders (24h + 1h)
- ✅ Stripe (international) + Flutterwave (African) donations
- ✅ Admin dashboard: appointments, availability, donations, profile
- ✅ Counselor profile fully editable from admin (no code needed)
- ✅ Working hours + blocked dates management
- ✅ Rate-limited contact form with auto-reply
- ✅ HTTPS, secure cookies, CSRF-safe, input validation throughout

---

## Color Palette

| Name | Hex |
|---|---|
| White | `#FFFFFF` |
| Black Cherry | `#6D0F15` |
| White Smoke | `#F4F4F4` |
| Light Coral | `#E27C82` |

Font: **Nunito** (Google Fonts)

---

© Hepzibal Ideas · All rights reserved