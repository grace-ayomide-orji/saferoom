import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Verify Flutterwave webhook signature
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers.get("verif-hash");

    if (!secretHash || signature !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await req.json();

    // Flutterwave sends event + data
    const { event, data } = body;

    if (event === "charge.completed" && data.status === "successful") {
      const txRef: string = data.tx_ref;
      const amount: number = data.amount;
      const currency: string = data.currency;
      const transactionId: string = String(data.id);

      // Check if we already processed this (idempotency)
      const existing = await prisma.donation.findFirst({
        where: { transactionReference: txRef },
      });

      if (existing && existing.status === "COMPLETED") {
        return NextResponse.json({ received: true }); // already handled
      }

      if (existing) {
        // Update the pending record
        const updated = await prisma.donation.update({
          where: { id: existing.id },
          data: {
            status: "COMPLETED",
            transactionReference: txRef, // keep tx_ref or swap to transaction ID
            amount,
            currency,
          },
        });

        if (!updated.isAnonymous && updated.email) {
          await sendDonationReceipt({
            name: updated.name || "Donor",
            email: updated.email,
            amount: Number(amount).toFixed(2),
            currency,
            reference: txRef,
          });
        }
      } else {
        // Create new record (for cases where client didn't pre-create one)
        const newDonation = await prisma.donation.create({
          data: {
            name: data.customer?.name || null,
            email: data.customer?.email || null,
            amount,
            currency,
            gateway: "FLUTTERWAVE",
            transactionReference: txRef,
            status: "COMPLETED",
            isAnonymous: !data.customer?.email,
          },
        });

        if (!newDonation.isAnonymous && newDonation.email) {
          await sendDonationReceipt({
            name: newDonation.name || "Donor",
            email: newDonation.email,
            amount: Number(amount).toFixed(2),
            currency,
            reference: txRef,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POST /api/webhooks/flutterwave]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}