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
  title: "AlertLens AI — Kubernetes Alert Summarizer & Root Cause Analysis",
  description:
    "AI-powered Kubernetes alert analysis, root cause detection, runbook generation, and incident correlation for SRE and DevOps teams. Paste Prometheus, Datadog, or CloudWatch alerts and get instant plain-English summaries.",
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
    "alertmanager",
    "kubernetes monitoring",
    "incident response",
  ],
  metadataBase: new URL("https://alertlens.vercel.app"),
  openGraph: {
    title: "AlertLens AI — Kubernetes Alert Summarizer",
    description:
      "Paste Kubernetes alerts from Prometheus, Datadog, or CloudWatch. Get instant root cause analysis, severity classification, and step-by-step runbooks.",
    type: "website",
    url: "https://alertlens.vercel.app",
    siteName: "AlertLens AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AlertLens AI — Kubernetes Alert Summarizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlertLens AI — Kubernetes Alert Summarizer",
    description:
      "Paste K8s alerts, get instant root cause analysis and runbooks. No signup required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Inline script to prevent FOUC - applies theme class before first paint
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('k8s-theme') || 'dark';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AlertLens AI",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "AI-powered Kubernetes alert analysis with root cause detection, runbook generation, and incident correlation for SRE and DevOps teams.",
              url: "https://alertlens.vercel.app",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Root cause analysis",
                "Severity classification (P0-P4)",
                "Step-by-step runbook generation",
                "Multi-alert correlation",
                "Slack integration",
                "Prometheus, Datadog, CloudWatch support",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {children}
      </body>
    </html>
  );
}
