import { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto md:px-6 px-4 py-16">
      <div className="mb-12">
        <h1 className="section-title">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mt-2">
          Last updated: {new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="prose max-w-none space-y-8 text-gray-600 text-[15px] leading-relaxed">
        {[
          {
            title: "1. Who We Are",
            body: `Safe Room is a free online counseling platform. Our mission is to provide accessible, faith-based counseling to anyone who needs it, completely free of charge. We are committed to protecting the privacy and dignity of every person who uses our platform.`,
          },
          {
            title: "2. Information We Collect",
            body: `When you book a session, we collect:
• Your full name and email address (required)
• Your phone number (optional)
• Your reason for seeking counseling (optional)

When you make a donation, we collect:
• Your name and email address (optional, you may donate anonymously)
• Payment information (processed securely by Stripe or Flutterwave. We never store your card details)
• Transaction references for record-keeping

When you submit a contact form, we collect your name, email, and message.`,
          },
          {
            title: "3. How We Use Your Information",
            body: `We use your information solely to:
• Provide the counseling services you requested
• Send you session confirmation, reminders, and management links
• Send donation receipts
• Respond to your contact form messages

We do not use your information for marketing without your explicit consent.`,
          },
          {
            title: "4. Confidentiality of Counseling Sessions",
            body: `Everything shared during a counseling session with Efe is strictly confidential. No session content, disclosures, or personal details shared verbally during a session will be recorded, stored, or shared with any third party.

The only exception is where there is a risk of serious harm to yourself or others, as required by applicable law.`,
          },
          {
            title: "5. Data Storage & Security",
            body: `Your data is stored in a secure, encrypted PostgreSQL database hosted on Neon (neon.tech). All data transmission uses HTTPS/TLS encryption. Access to the database is strictly limited to authorised personnel only.

We do not store payment card details. All payment processing is handled by Stripe (stripe.com) and Flutterwave (flutterwave.com), both of which are PCI DSS compliant.`,
          },
          {
            title: "6. Sharing Your Information",
            body: `We will never sell, rent, or trade your personal information. We share your data only with:
• Google (to create Calendar events and Meet links for your session)
• Stripe or Flutterwave (to process donations)
• Our email provider (to send you notifications)

Each of these providers is contractually bound to protect your data.`,
          },
          {
            title: "7. Your Rights",
            body: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your information
• Withdraw consent at any time

To exercise any of these rights, please contact us at the email on the Contact page.`,
          },
          {
            title: "8. Appointment Tokens",
            body: `Each booking generates a unique, cryptographically secure management token. This token is included in your confirmation email. Anyone with this link can view and manage your appointment, so please keep it private.`,
          },
          {
            title: "9. Cookies",
            body: `We use only strictly necessary cookies to manage admin sessions. No tracking, advertising, or analytics cookies are used on this platform.`,
          },
          {
            title: "10. Changes to This Policy",
            body: `We may update this policy from time to time. Any significant changes will be indicated by updating the "Last updated" date above. Continued use of the platform constitutes acceptance of the updated policy.`,
          },
          {
            title: "11. Contact",
            body: `For any privacy-related questions or requests, please use the Contact page or email us directly. We aim to respond within 48 hours.`,
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">
              {section.title}
            </h2>
            <div className="whitespace-pre-line">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}