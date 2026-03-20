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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
