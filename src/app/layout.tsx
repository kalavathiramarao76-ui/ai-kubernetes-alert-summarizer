import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "K8s Alert AI | Kubernetes Alert Summarizer",
  description:
    "AI-powered Kubernetes alert analysis, root cause detection, runbook generation, and incident correlation for SRE and DevOps teams.",
  keywords: [
    "kubernetes",
    "alert",
    "AI",
    "SRE",
    "DevOps",
    "incident management",
    "root cause analysis",
    "runbook",
    "prometheus",
    "grafana",
    "pagerduty",
  ],
  openGraph: {
    title: "K8s Alert AI | Kubernetes Alert Summarizer",
    description:
      "AI-powered Kubernetes alert analysis for SRE teams. Paste alerts, get instant root cause analysis and runbooks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
