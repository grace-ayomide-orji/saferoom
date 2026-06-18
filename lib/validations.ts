import { z } from "zod";

// ── Booking ──────────────────────────────────────────────
export const singleBookingSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  sessionType: z.enum(["VIDEO", "AUDIO"]),
  reasonForSession: z.string().optional(),
});

export const recurringBookingSchema = singleBookingSchema.extend({
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date"),
});

// ── Reschedule ───────────────────────────────────────────
export const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// ── Donation ─────────────────────────────────────────────
export const donationSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  amount: z.number().min(1, "Minimum donation is 1"),
  currency: z.string().default("USD"),
  gateway: z.enum(["STRIPE", "FLUTTERWAVE"]),
  isAnonymous: z.boolean().default(false),
});

// ── Contact ──────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ── Admin auth ───────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ── Working hours ────────────────────────────────────────
export const workingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
});

// ── Counselor profile ────────────────────────────────────
export const counselorProfileSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  qualifications: z.array(z.string()),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});

export const passwordSettingSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ── Blocked dates ────────────────────────────────────────
export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});