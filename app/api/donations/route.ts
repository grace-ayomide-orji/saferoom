import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { donationSchema } from "@/lib/validations";
import { sendDonationReceipt } from "@/lib/email";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO MODE — Stripe and Flutterwave are disabled.
// Donations are saved to the database and a receipt email is sent.
// No real money is processed.
// To go live: uncomment the Stripe/Flutterwave blocks and remove the
// demo handler below.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = donationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;

    const demoReference = `demo-${crypto.randomBytes(8).toString("hex")}`;

    await prisma.donation.create({
      data: {
        name: data.isAnonymous ? null : (data.name ?? null),
        email: data.isAnonymous ? null : (data.email ?? null),
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        gateway: data.gateway,
        transactionReference: demoReference,
        status: "COMPLETED",        
        isAnonymous: data.isAnonymous,
      },
    });

    // Send receipt email if donor provided email
    if (!data.isAnonymous && data.email) {
      await sendDonationReceipt({
        name: data.name || "Friend",
        email: data.email,
        amount: data.amount.toFixed(2),
        currency: data.currency.toUpperCase(),
        reference: demoReference,
        isDemo: true,
      });
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({
      success: true,
      url: `${APP_URL}/donate/success?ref=${demoReference}`,
    });
  } catch (error) {
    console.error("[POST /api/donations]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



//this is fully function for when the site is sold or inuse for real services
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { donationSchema } from "@/lib/validations";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// // Create payment intent / initialize donation
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const parsed = donationSchema.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json({ error: "Invalid data" }, { status: 400 });
//     }

//     const data = parsed.data;
//     const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

//     if (data.gateway === "STRIPE") {
//       // Create Stripe payment intent
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: [
//           {
//             price_data: {
//               currency: data.currency.toLowerCase(),
//               unit_amount: Math.round(data.amount * 100),
//               product_data: {
//                 name: "Donation - Safe Room",
//                 description: "Support free counseling services",
//               },
//             },
//             quantity: 1,
//           },
//         ],
//         metadata: {
//           donorName: data.name || "Anonymous",
//           donorEmail: data.email || "",
//           isAnonymous: String(data.isAnonymous),
//         },
//         customer_email: data.email || undefined,
//         success_url: `${APP_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${APP_URL}/donate`,
//       });

//       // Create pending donation record
//       await prisma.donation.create({
//         data: {
//           name: data.isAnonymous ? null : data.name,
//           email: data.email,
//           amount: data.amount,
//           currency: data.currency.toUpperCase(),
//           gateway: "STRIPE",
//           transactionReference: session.id,
//           status: "PENDING",
//           isAnonymous: data.isAnonymous,
//         },
//       });

//       return NextResponse.json({ url: session.url });
//     }

//     if (data.gateway === "FLUTTERWAVE") {
//       // Return Flutterwave config for client-side inline
//       return NextResponse.json({
//         publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
//         amount: data.amount,
//         currency: data.currency,
//         customerName: data.name || "Anonymous",
//         customerEmail: data.email || "anonymous@saferoom.com",
//         redirectUrl: `${APP_URL}/donate/success`,
//         txRef: `swe-${Date.now()}`,
//       });
//     }

//     return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
//   } catch (error) {
//     console.error("[POST /api/donations]", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }