import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Donation Received — Thank You!" };

interface Props {
  searchParams: { session_id?: string; ref?: string };
}

async function getDonation(sessionId?: string, ref?: string) {
  try {
    if (sessionId) {
      return await prisma.donation.findFirst({
        where: { transactionReference: sessionId },
      });
    }
    if (ref) {
      return await prisma.donation.findFirst({
        where: { transactionReference: String(ref) },
      });
    }
    return null;
  } catch {
    return null;
  }
}

export default async function DonateSuccessPage({ searchParams }: Props) {
  const donation = await getDonation(
    searchParams.session_id,
    searchParams.ref
  );

  return (
    <div className="page-enter min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="card max-w-md w-full text-center">
        {/* Success animation */}
        <div className="w-20 h-20 bg-brand-coral/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">💙</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">
          Thank you so much!
        </h1>

        <p className="text-gray-500 leading-relaxed mb-6">
          Your generous donation has been received. It means the world and
          directly helps Safe Room continue offering free counseling to
          those who need it most.
        </p>

        {donation && (
          <div className="bg-brand-smoke rounded-2xl p-5 mb-6 text-left space-y-2">
            {donation.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold">Amount</span>
                <span className="font-extrabold text-gray-900">
                  {donation.currency}{" "}
                  {Number(donation.amount).toLocaleString("en", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {donation.transactionReference && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold">Reference</span>
                <span className="font-bold text-gray-700 text-xs break-all max-w-[60%] text-right">
                  {donation.transactionReference.slice(0, 24)}…
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-semibold">Status</span>
              <span className="font-extrabold text-green-600">Received ✓</span>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-400 mb-8">
          {donation?.email
            ? `A receipt has been sent to ${donation.email}.`
            : "If you provided an email, a receipt is on its way."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary p-2">
            Back to Home
          </Link>
          <Link href="/book" className="btn-secondary p-2">
            Book a Session
          </Link>
        </div>
      </div>
    </div>
  );
}