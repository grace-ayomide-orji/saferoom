import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Heart } from "@/components/icons";

export const metadata: Metadata = { title: "Donations" };

async function getDonations() {
  const [donations, stats] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);
  return { donations, stats };
}

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-500",
};

const GATEWAY_BADGE: Record<string, string> = {
  STRIPE: "bg-blue-100 text-blue-700",
  FLUTTERWAVE: "bg-orange-100 text-orange-700",
};

export default async function DonationsPage() {
  const { donations, stats } = await getDonations();

  return (
    <div className="max-w-5xl space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-2xl font-black text-gray-900">
            ${Number(stats._sum.amount ?? 0).toLocaleString("en", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-bold text-gray-500 mt-1">Total Received</p>
        </div>
        <div className="card">
          <p className="text-2xl font-black text-gray-900">{stats._count}</p>
          <p className="text-sm font-bold text-gray-500 mt-1">Total Donors</p>
        </div>
        <div className="card">
          <p className="text-2xl font-black text-gray-900">
            ${stats._count > 0
              ? (Number(stats._sum.amount ?? 0) / stats._count).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-sm font-bold text-gray-500 mt-1">Average Donation</p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {donations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3 text-brand-coral flex justify-center"><Heart className="w-5 h-5"/></p>
            <p className="font-semibold">No donations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-smoke border-b border-gray-100">
                <tr>
                  {["Donor", "Amount", "Gateway", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-brand-smoke/50 transition-colors">
                    <td className="px-5 py-4">
                      {d.isAnonymous ? (
                        <span className="text-gray-400 italic text-sm">Anonymous</span>
                      ) : (
                        <>
                          <p className="font-bold text-gray-900">{d.name || "—"}</p>
                          {d.email && (
                            <p className="text-gray-400 text-xs">{d.email}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-gray-900">
                        {d.currency} {Number(d.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          GATEWAY_BADGE[d.gateway] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.gateway}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          STATUS_BADGE[d.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {format(new Date(d.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}