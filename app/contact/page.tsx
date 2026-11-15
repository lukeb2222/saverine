import type { Metadata } from "next";
import Link from "next/link";
import { site, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a Saverine preorder, sizing or shipping? Email us and a real person will get back to you.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <div className="container-x max-w-3xl py-10 md:py-16">
      <p className="eyebrow text-red">Help</p>
      <h1 className="h-display mt-2 text-4xl md:text-5xl">Contact</h1>
      <p className="mt-4 text-lg text-ink/80">
        Questions about an order, sizing, or just want to say hey? Email us and a real person will get back to you.
      </p>
      <a href={`mailto:${site.contactEmail}`} className="btn btn-red mt-8">
        {site.contactEmail}
      </a>
      <p className="mt-8 text-ink/80">
        Have an order number? Put it in the subject line. A lot of answers are already in the{" "}
        <Link href="/faq" className="link">FAQ</Link>.
      </p>
      {socialLinks.length > 0 && (
        <div className="mt-8 flex gap-6">
          {socialLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="link">{l.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}
