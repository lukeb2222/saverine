import type { Metadata, Viewport } from "next";
import { Archivo_Black, DM_Sans, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { PreorderBanner } from "@/components/PreorderBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker", display: "swap" });
const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo-black", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Good Days Only`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    title: `${site.name} — Good Days Only`,
    description: site.description,
    siteName: site.name,
    type: "website",
    images: [{ url: `${site.url}/images/good-days-tee-olive-tree.jpg`, width: 896, height: 1200 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#23211F" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${marker.variable} ${archivo.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
