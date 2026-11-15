import type { Metadata } from "next";
import Link from "next/link";
import { faqSections } from "@/data/faq";
import { site } from "@/data/site";
import { Accordion } from "@/components/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How Saverine preorders work, when orders ship, refunds, sizing and care.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSections.flatMap((s) =>
      s.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };
  return (
    <div className="container-x max-w-3xl py-10 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="eyebrow text-red">Help</p>
      <h1 className="h-display mt-2 text-4xl md:text-5xl">FAQ</h1>
      <p className="mt-4 text-lg text-ink/80">
        The short version: you order now, we make it, it ships by {site.preorder.shipsBy}.
      </p>
      {faqSections.map((section) => (
        <section key={section.id} id={section.id} className="mt-12">
          <h2 className="h-display border-b-2 border-ink pb-3 text-xl">{section.title}</h2>
          {section.items.map((item) => (
            <Accordion key={item.q} title={item.q}>
              <p>{item.a}</p>
            </Accordion>
          ))}
        </section>
      ))}
      <p className="mt-12 text-ink/80">
        Still stuck? <Link href="/contact" className="link">Get in touch</Link> or check the{" "}
        <Link href="/size-guide" className="link">size guide</Link>.
      </p>
    </div>
  );
}
