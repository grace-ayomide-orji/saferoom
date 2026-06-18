import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "Safe Room",
    template: "%s | Safe Room",
  },
  description:"Free online counseling sessions with us. Book your session today - no account required.",
  keywords: ["counseling", "faith-based counseling", "online sessions", "mental health", "Safe Room"],
  authors: [{ name: "Grace Ayomide Orji" }],
  openGraph: {
    title: "Safe Room",
    description: "Free online counseling sessions. Book today.",
    type: "website",
  },
  icons:{
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
