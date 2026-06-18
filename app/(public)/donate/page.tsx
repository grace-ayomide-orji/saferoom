"use client";
import { useState } from "react";
import { Metadata } from "next";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export default function DonatePage() {
  const [gateway, setGateway] = useState<"STRIPE" | "FLUTTERWAVE">("STRIPE");
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = customAmount ? Number(customAmount) : amount;

  async function handleDonate() {
    if (finalAmount < 1) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!isAnonymous && (!name || !email)) {
      setError("Please provide your name and email, or donate anonymously.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway,
          amount: finalAmount,
          currency,
          name: isAnonymous ? undefined : name,
          email: isAnonymous ? undefined : email,
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      if (gateway === "STRIPE" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (gateway === "FLUTTERWAVE") {
        // Dynamically load Flutterwave inline JS
        const FlutterwaveCheckout = (window as unknown as Record<string, unknown>)["FlutterwaveCheckout"] as ((config: Record<string, unknown>) => void) | undefined;
        if (!FlutterwaveCheckout) {
          setError("Payment system not loaded. Please refresh and try again.");
          return;
        }

        FlutterwaveCheckout({
          public_key: data.publicKey,
          tx_ref: data.txRef,
          amount: data.amount,
          currency: data.currency,
          customer: {
            email: data.customerEmail,
            name: data.customerName,
          },
          customizations: {
            title: "Safe Room",
            description: "Donation — Hepzibal Ideas",
            logo: "/logo.png",
          },
          callback: (response: Record<string, unknown>) => {
            if (response.status === "successful") {
              window.location.href = `/donate/success?ref=${response.transaction_id}`;
            }
          },
          onclose: () => setLoading(false),
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter min-h-screen bg-brand-smoke py-16 px-4">
      {/* Flutterwave script */}
      <script src="https://checkout.flutterwave.com/v3.js" async />

      <div className="lg:max-w-xl md:w-[90vw] mx-auto">
        <div className="text-center md:mb-14 mb-8">
          <h1 className="text-xl md:text-2xl text-brand-coral">Make a Donation</h1>
          <p className="text-sm md:text-[15px] max-w-lg mx-auto">
            Your generosity keeps counseling free for everyone who needs it.
          </p>
        </div>

        <div className="card">
          {/* Gateway selector */}
          <div className="mb-6">
            <label className="label">Payment method</label>
            <div className="grid grid-cols-2 gap-3">
              {(["STRIPE", "FLUTTERWAVE"] as const).map((gw) => (
                <button
                  key={gw}
                  onClick={() => setGateway(gw)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    gateway === gw
                      ? "border-brand-cherry bg-brand-cherry/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-extrabold text-sm text-gray-900">
                    {gw === "STRIPE" ? "Card / International" : "Flutterwave"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {gw === "STRIPE"
                      ? "Visa, Mastercard, etc."
                      : "Best for African payments"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="mb-5">
            <label className="label">Currency</label>
            <select
              className="input-field"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GHS">GHS - Ghanaian Cedi</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>

          {/* Amount presets */}
          <div className="mb-5">
            <label className="label">Amount ({currency})</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustomAmount("");
                  }}
                  className={`md:px-4 px-2 md:py-2 py-1 rounded-xl text-sm md:font-bold transition-all ${
                    amount === a && !customAmount
                      ? "bg-brand-cherry text-white shadow-cherry"
                      : "bg-brand-smoke text-gray-700 hover:bg-brand-cherry/10"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="Or enter custom amount"
              value={customAmount}
              min={1}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>

          {/* Anonymous toggle */}
          <div className="mb-5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-cherry"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-cherry transition-colors">
                Donate anonymously
              </span>
            </label>
          </div>

          {/* Donor details */}
          {!isAnonymous && (
            <div className="space-y-4 mb-5">
              <div>
                <label className="label">Your Name</label>
                <input
                  className="input-field"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email (for receipt)</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleDonate}
            disabled={loading}
            className="btn-coral w-full text-base py-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              `Donate ${currency} ${finalAmount} 💙`
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Payments are processed securely. Safe Room is an independent NGO body.
          </p>
        </div>
      </div>
    </div>
  );
}