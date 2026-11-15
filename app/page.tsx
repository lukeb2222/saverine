import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { Badge, Wordmark } from "@/components/brand";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { RoughEdge } from "@/components/RoughEdge";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const HERO = `${site.basePath}/images/good-days-tee-olive-tree.jpg`;

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-bone">
        <div className="grid min-h-[calc(100svh-6.5rem)] lg:grid-cols-[1.05fr_1fr]">
          {/* photo: full-bleed on mobile, right half on desktop */}
          <div className="absolute inset-0 -z-10 overflow-hidden lg:relative lg:order-2 lg:z-0">
            <Image
              src={HERO}
              alt="A friend laughing on the tailgate of an old pickup on a desert highway, wearing the Good Days Tee in Olive Tree"
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="anim-settle object-cover object-[50%_22%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#23211F_0%,#23211F_44%,transparent_70%)] lg:bg-[linear-gradient(to_right,#23211F_0%,transparent_45%)]" />
          </div>

          <div className="container-x flex flex-col justify-end pb-10 pt-[40svh] lg:order-1 lg:justify-center lg:py-20 lg:pl-[max(2.5rem,calc((100vw-78rem)/2+2.5rem))] lg:pr-10">
            <p className="eyebrow anim-rise text-gold">{site.preorder.dropName} · Preorder open</p>
            <h1 className="mt-4">
              <Wordmark className="wordmark-draw w-full max-w-[34rem]" />
              <span style={{ "--d": "900ms" } as React.CSSProperties} className="h-display anim-rise mt-4 block text-3xl sm:mt-5 sm:text-5xl">Good Days Only</span>
            </h1>
            <p style={{ "--d": "1050ms" } as React.CSSProperties} className="anim-rise mt-4 hidden max-w-md text-lg text-bone/85 sm:block">
              Sun-faded, garment-dyed and very soft. Made for the coast, worn everywhere else too.
            </p>
            <div style={{ "--d": "1200ms" } as React.CSSProperties} className="anim-rise mt-6 flex flex-wrap items-center gap-5 sm:mt-8">
              <Link href="/#drop" className="btn btn-red">
                Preorder the first drop
              </Link>
              <p className="font-marker text-xl text-gold">{site.secondaryLine}</p>
            </div>
          </div>
        </div>
        </section>

      <Marquee items={["Good Days Only", "City to Coast", "Est. 2026", "First drop: preorder now", "City · Coast · Mountain · Road"]} />

      {/* THE DROP */}
      <section id="drop" className="container-x py-16 md:py-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-red">Drop 01 · Est. 2026</p>
            <h2 className="h-display mt-2 text-4xl md:text-5xl">The Drop</h2>
          </div>
          <p className="max-w-sm text-ink/80">
            Two pieces, made to order. Preorder closes {site.preorder.closesLabel}; everything ships by {site.preorder.shipsBy}.
          </p>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* WEAR IT ANYWHERE */}
      <section className="relative bg-bone-deep py-16 md:py-24">
        <RoughEdge color="text-bone" variant={1} />
        <div className="container-x">
          <h2 className="h-display text-3xl md:text-4xl">Wear it anywhere</h2>
          <p className="mt-2 font-marker text-xl text-red">City · Coast · Mountain · Road</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {[
              { label: "City", src: "/images/tee-midnight-swell-model.jpg", alt: "Good Days Tee in Midnight Swell on a city street" },
              { label: "Coast", src: "/images/hoodie-salt-flat-model-back.jpg", alt: "City to Coast Hoodie in Salt Flat on the beach, back print" },
              { label: "Mountain", src: "/images/hoodie-olive-tree-model.jpg", alt: "City to Coast Hoodie in Olive Tree in the mountains" },
              { label: "Road", src: "/images/good-days-tee-olive-tree.jpg", alt: "Good Days Tee in Olive Tree on a desert road trip" },
            ].map((t) => (
              <li key={t.label} className="reveal group relative aspect-[4/5] overflow-hidden rounded-[3px] bg-ink">
                <Image
                  src={`${site.basePath}${t.src}`}
                  alt={t.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12">
                  <p className="h-display text-lg text-bone md:text-xl">{t.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STORY */}
      <section className="relative py-16 md:py-24">
        <RoughEdge color="text-bone-deep" variant={2} />
        <div className="reveal container-x grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <Badge className="mx-auto h-44 w-44 text-ink md:h-56 md:w-56" sun="#B8483A" />
          <div className="max-w-2xl">
            <p className="eyebrow text-red">The story</p>
            <h2 className="h-display mt-2 text-3xl md:text-4xl">Made for good days</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/90">
              Saverine started with a simple idea: the best days deserve clothes that feel like them. So we make soft,
              sun-faded pieces that look like they&rsquo;ve already been on a few road trips. Wear them to the beach, on
              the subway, up the chairlift or four hours into a drive with the windows down. Wherever you are, if
              it&rsquo;s a good day, you&rsquo;re dressed for it.
            </p>
            <p className="mt-5 font-marker text-2xl">{site.tagline}</p>
          </div>
        </div>
      </section>

      {/* SIGNUP */}
      <section id="signup" className="relative bg-navy py-16 text-bone md:py-20">
        <RoughEdge color="text-bone" />
        <div className="reveal container-x flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="h-display text-3xl md:text-4xl">Get first dibs on drop 2</h2>
            <p className="mt-3 max-w-md text-bone/80">
              New colorways are on deck. Get on the list and you&rsquo;ll hear before anyone else.
            </p>
          </div>
          <SignupForm />
        </div>
      </section>
    </>
  );
}
