import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.donation.updateMany({
      where: { transactionReference: session.id },
      data: { status: "COMPLETED" },
    });

    // Send receipt
    const isAnonymous = session.metadata?.isAnonymous === "true";
    if (!isAnonymous && session.customer_email) {
      await sendDonationReceipt({
        name: session.metadata?.donorName || "Donor",
        email: session.customer_email,
        amount: (session.amount_total! / 100).toFixed(2),
        currency: session.currency?.toUpperCase() || "USD",
        reference: session.id,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await prisma.donation.updateMany({
      where: { transactionReference: session.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
