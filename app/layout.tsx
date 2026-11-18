import type { Metadata, Viewport } from "next";
import { Archivo_Black, DM_Sans, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { site, socialLinks } from "@/data/site";
import { PreorderBanner } from "@/components/PreorderBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SupportChat } from "@/components/SupportChat";

const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker", display: "swap" });
const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo-black", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

const HOME_TITLE = `${site.name} — Good Days Only | Garment-Dyed Tees & Hoodies`;
/** 1200×630 landscape image used when a link to the site is shared. */
const SHARE_IMAGE = { url: `${site.url}/images/share.jpg`, width: 1200, height: 630, alt: "Saverine — Good Days Only" };

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: HOME_TITLE, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    title: HOME_TITLE,
    description: site.description,
    siteName: site.name,
    type: "website",
    locale: "en_US",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image" },
};

/** Tells search engines who runs the site, and which social profiles are ours. */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: `${site.url}/`,
      logo: `${site.url}/icon.svg`,
      slogan: "Good Days Only",
      description: site.description,
      email: site.contactEmail,
      ...(socialLinks.length ? { sameAs: socialLinks.map((l) => l.href) } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: `${site.url}/`,
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
};

export const viewport: Viewport = { themeColor: "#23211F" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${marker.variable} ${archivo.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }} />
        <a href="#main" className="btn btn-red sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
          Skip to content
        </a>
        <PreorderBanner />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <SupportChat />
      </body>
    </html>
  );
}
