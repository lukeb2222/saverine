import Link from "next/link";
import { site } from "@/data/site";
import { Badge, Wordmark } from "./brand";
import { RoughEdge } from "./RoughEdge";

export function Footer() {
  return (
    <footer className="relative mt-auto bg-ink text-bone">
      <RoughEdge color="text-navy" variant={2} />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <Wordmark className="h-12 w-auto" />
          <p className="eyebrow mt-4 text-bone/70">{site.tagline}</p>
          <p className="mt-1 font-marker text-xl text-gold">{site.secondaryLine}</p>
        </div>
        <nav aria-label="Help" className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-2 text-gold">Help</p>
          <Link href="/faq" className="hover:text-gold">FAQ</Link>
          <Link href="/size-guide" className="hover:text-gold">Size guide</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
          <Link href="/faq#refunds" className="hover:text-gold">Refunds &amp; cancellation</Link>
        </nav>
        <nav aria-label="Social" className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-2 text-gold">Follow</p>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>
          <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-gold">TikTok</a>
          <a href={`mailto:${site.contactEmail}`} className="hover:text-gold">{site.contactEmail}</a>
        </nav>
        <Badge className="h-28 w-28 text-bone/90" />
      </div>
      <div className="border-t border-bone/15">
        <p className="container-x py-5 text-xs text-bone/60">
          © {site.copyrightYear} {site.name}. All preorders ship by {site.preorder.shipsBy}.
        </p>
      </div>
    </footer>
  );
}
