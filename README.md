# Safe Room

### Free Online Counseling & Donation Platform

---

## Overview

Safe Room is a secure platform that enables individuals to book counseling sessions, make donations, and communicate with counselors through a simple and accessible interface.

The platform provides appointment scheduling, secure payment processing, calendar integration, automated notifications, and an administrative dashboard for managing operations.

---

## Tech Stack

| Category             | Technology          |
| -------------------- | ------------------- |
| Framework            | Next.js             |
| Language             | TypeScript          |
| Styling              | Tailwind CSS        |
| Database             | PostgreSQL          |
| ORM                  | Prisma              |
| Payments             | Stripe, Flutterwave |
| Email Services       | SMTP                |
| Calendar Integration | Google Calendar     |
| Video Meetings       | Google Meet         |
| Hosting              | Vercel              |

---

## Core Features

* Secure online counseling appointment booking
* Donation processing through multiple payment providers
* Automated email confirmations and reminders
* Calendar and meeting link generation
* Appointment management and rescheduling
* Administrative dashboard for operational management
* Availability and scheduling controls
* Contact and support system
* Input validation and security protections
* Mobile-friendly responsive interface

---

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd safe-room
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env.local
```

Populate the required environment variables before running the application.

### Database Setup

```bash
pnpm run db:push
pnpm run db:seed
```

### Run Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## Deployment

The application can be deployed on platforms such as Vercel and connected to a PostgreSQL database provider.

### Production Steps

1. Configure production environment variables.
2. Deploy the application.
3. Run database migrations.

```bash
npx prisma migrate deploy
```

---

## Security

Safe Room implements several security measures including:

* Secure session handling
* Input validation
* Rate limiting
* Protected administrative functionality
* HTTPS support
* Secure payment processing
* CSRF protection

---

## Project Structure

The codebase follows a modular architecture organized around:

* Public-facing pages
* Administrative dashboard
* API routes
* Database layer
* Authentication layer
* Scheduling services
* Email services
* Validation utilities

---

## Design System

### Color Palette

| Name         | Hex       |
| ------------ | --------- |
| White        | `#FFFFFF` |
| Black green | `#68764B` |
| White Smoke  | `#F2F2F2` |
| Light Coral  | `#E27C82` |

### Typography

**Nunito**

---

© Safe Room. All rights reserved.
