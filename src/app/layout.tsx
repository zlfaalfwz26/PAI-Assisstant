import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { themeInitScript } from "@/lib/theme";

const siteUrl = process.env.OPENROUTER_SITE_URL?.trim();

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.APP_NAME} — Kenali PAI Lebih Dekat`,
    template: `%s · ${siteConfig.APP_NAME}`,
  },
  description: siteConfig.APP_DESCRIPTION,
  applicationName: siteConfig.APP_NAME,
  ...(siteUrl && /^https?:\/\//.test(siteUrl) ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: siteConfig.APP_NAME,
    description: siteConfig.APP_DESCRIPTION,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#071426" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#konten" className="skip-link">
          Langsung ke konten
        </a>
        <div className="app-shell">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
