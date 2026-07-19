import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import StrikeBot from "@/components/StrikeBot";

export const metadata: Metadata = {
  title: "Aero Store — Build. Innovate. Launch.",
  description: "India's developer-first app marketplace. Verified developers, secure apps, zero bloatware. Publish your app to thousands of users on the Aero Store platform.",
  openGraph: {
    title: "Aero Store — India's Premium App Marketplace",
    description: "Verified developers, secure apps, zero bloatware. Join the Aero Store platform today.",
    url: "https://aerotechnologiesstore.github.io/",
    siteName: "Aero Store",
    images: [
      {
        url: "https://aerotechnologiesstore.github.io/logos/logo-main.png",
        width: 800,
        height: 800,
        alt: "Aero Store Logo",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/logos/logo-main.png",
    shortcut: "/logos/logo-main.png",
    apple: "/logos/logo-main.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self';" />
        <meta name="referrer" content="no-referrer" />
        <meta name="google-adsense-account" content="ca-pub-7936666541728603" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7936666541728603"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <AuthProvider>
          {children}
          <StrikeBot />
        </AuthProvider>
      </body>
    </html>
  );
}
