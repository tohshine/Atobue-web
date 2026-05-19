"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import Reveal from "./_components/Reveal";

type Feature = {
  title: string;
  body: string;
  align: "left" | "right";
};

type FaqItem = {
  q: string;
  a: string;
};

function LogoMark() {
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-soft backdrop-blur transition-transform duration-300 hover:scale-[1.02]">
      <Image
        src="/decor/xelfcon-logo.png"
        alt="Xelfcon Logo"
        width={84}
        height={28}
        className="h-7 w-auto md:h-8"
      />
    </div>
  );
}

function StoreButtons({ className = "" }: { className?: string }) {
  const [device, setDevice] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(userAgent)) {
      setDevice("android");
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDevice("ios");
    } else {
      setDevice("other");
    }
  }, []);

  const showIOS = device === "ios" || device === "other";
  const showAndroid = device === "android" || device === "other";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {showIOS && (
        <a
          href="#"
          aria-label="Download on the App Store"
          className="inline-block transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Image
            src="/decor/apple.png"
            alt="Download on the App Store"
            width={150}
            height={50}
            className="h-[50px] w-auto rounded-xl ring-1 ring-white/10"
          />
        </a>
      )}

      {showAndroid && (
        <a
          href="#"
          aria-label="Get it on Google Play"
          className="inline-block transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Image
            src="/decor/google.png"
            alt="Get it on Google Play"
            width={150}
            height={50}
            className="h-[50px] w-auto rounded-xl ring-1 ring-white/10"
          />
        </a>
      )}
    </div>
  );
}

function PhoneStack({ 
  side = "left",
  backImage = "/decor/Explore.png",
  frontImage = "/decor/properties.png"
}: { 
  side?: "left" | "right";
  backImage?: string;
  frontImage?: string;
}) {
  const isLeft = side === "left";
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[220px] md:mx-0">
      <div
        className={[
          "animate-phone-back absolute top-12 z-10 h-[280px] w-[140px]",
          isLeft 
            ? "left-[calc(50%-80px)] md:left-0" 
            : "left-[calc(50%-60px)] md:left-auto md:right-0",
        ].join(" ")}
      >
        <div className="h-full w-full rotate-[-4deg] overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-soft">
          <Image
            src={backImage}
            alt="Phone mockup"
            width={140}
            height={280}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div
        className={[
          "animate-phone-front absolute top-2 z-20 h-[300px] w-[150px]",
          isLeft 
            ? "left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0" 
            : "left-1/2 -translate-x-1/2 md:right-10 md:translate-x-0",
        ].join(" ")}
      >
        <div className="h-full w-full rotate-3 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-soft">
          <Image
            src={frontImage}
            alt="Phone mockup"
            width={150}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="animate-float-glow absolute inset-0 z-0 rounded-3xl bg-(--brand)/20 opacity-60 blur-3xl" />
    </div>
  );
}

function BulletHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-(--brand)">
      <span className="h-2 w-2 animate-pulse rounded-full bg-(--brand) shadow-[0_0_16px_rgba(45,179,255,0.7)]" />
      <h3 className="text-sm font-semibold tracking-wide md:text-base">{text}</h3>
    </div>
  );
}

function FeatureRow({ item, index }: { item: Feature; index: number }) {
  const isLeft = item.align === "left";
  
  // Determine images based on feature title
  const getImages = (title: string) => {
    if (title.toLowerCase().includes("property") || title.toLowerCase().includes("manage")) {
      return { back: "/decor/xelfcon-manage-feature-back.png", front: "/decor/xelfcon-manage-feature-front.png" };
    } else if (title.toLowerCase().includes("place") || title.toLowerCase().includes("rent")) {
      return { back: "/decor/xelfcon-space-feature-back.png", front: "/decor/xelfcon-space-feature-front.png" };
    } else if (title.toLowerCase().includes("caretaker") || title.toLowerCase().includes("earn")) {
      return { back: "/decor/properties.png", front: "/decor/caretaker.png" };
    }
    return { back: "/decor/Explore.png", front: "/decor/properties.png" };
  };
  
  const images = getImages(item.title);
  
  return (
    <section className="mt-14 md:mt-18">
      <div className="container-page">
        <div
          className={[
            "grid items-center gap-10 md:gap-14",
            "md:grid-cols-2",
          ].join(" ")}
        >
          <Reveal
            variant={isLeft ? "slide-right" : "slide-left"}
            delay={index * 80}
            className={isLeft ? "order-1" : "order-1 md:order-2"}
          >
            <PhoneStack
              side={isLeft ? "left" : "right"}
              backImage={images.back}
              frontImage={images.front}
            />
          </Reveal>

          <Reveal
            variant={isLeft ? "slide-left" : "slide-right"}
            delay={index * 80 + 100}
            className={isLeft ? "order-2" : "order-2 md:order-1"}
          >
            <div className="rounded-3xl border border-white/10 bg-white/4 p-5 shadow-soft backdrop-blur transition-transform duration-500 hover:-translate-y-1 md:p-6">
              <BulletHeading text={item.title} />
              <p className="mt-3 text-sm leading-7 text-white/75 md:text-[15px]">
                {item.body}
              </p>
              <div className="mt-4">
                <StoreButtons />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DropletPanel() {
  return (
    <div className="relative mx-auto mt-8 w-full max-w-[560px]">
      {/* droplet-ish shape */}
      <div className="absolute inset-0 -z-10 rounded-[42px] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,179,255,0.35),rgba(255,255,255,0.04)_55%,rgba(0,0,0,0)_100%)] opacity-90" />
      <div className="card-soft shadow-soft px-6 py-7 transition-transform duration-500 hover:-translate-y-1 md:px-9 md:py-8">
        <p className="text-center text-sm leading-7 text-white/80 md:text-[15px]">
          Digitize your property, find verified rentals fast, or become a caretaker and start earning in our
          all in one powerful app.
        </p>
        <StoreButtons className="mt-5 justify-center" />
      </div>
    </div>
  );
}

function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-10">
      <Reveal variant="slide-right">
        <h2 className="text-2xl font-semibold md:text-3xl">Faq</h2>
        <div className="mt-2 h-1 w-12 rounded-full bg-(--brand)" />
        <p className="mt-4 max-w-[340px] text-sm leading-7 text-white/70">
          Got questions? We’ve answered the most common things users ask about using, renting, managing, or earning with Xelfcon.
        </p>

        <div className="mt-6 max-w-[320px]">
          <div className="relative h-[180px] w-full">
            <div className="absolute -left-2 top-4 h-[160px] w-[200px] -rotate-6 rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-soft" />
            <div className="absolute left-6 top-8 h-[140px] w-[240px] rotate-10 rounded-3xl bg-(--brand)/20 ring-1 ring-white/10 shadow-soft" />
            <div className="absolute left-3 top-10 grid h-[140px] w-[240px] place-items-center rounded-3xl bg-white/10 ring-1 ring-white/10 shadow-soft">
              <span className="text-4xl">📣</span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="space-y-3">
        {items.map((it, idx) => {
          const isOpen = idx === openIndex;
          return (
            <Reveal key={it.q} variant="fade-up" delay={idx * 60}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-soft backdrop-blur transition-colors duration-300 hover:border-white/20">
                <button
                  type="button"
                  className={[
                    "flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors",
                    isOpen ? "bg-(--brand)/20" : "hover:bg-white/5",
                  ].join(" ")}
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-white/90">{it.q}</span>
                  <span className={`text-white/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                <div className={`faq-answer ${isOpen ? "faq-answer-open" : ""}`}>
                  <div className="faq-answer-inner">
                    <div className="px-4 pb-4 pt-3 text-sm leading-6 text-white/70">{it.a}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const features = useMemo<Feature[]>(
    () => [
      {
        title: "List and manage your property",
        body:
          "As a property owner, you can easily set up your property, list any space you have available for rent, keep track of your tenants, and even hire someone to help manage things for you. It’s a simple way to stay in control of your property without stress.",
        align: "left",
      },
      {
        title: "Looking for a place? Start here",
        body:
          "You can easily find places to rent, whether it’s a room, apartment, condo, or an entire house. You can also discover lands available for rent for things like farming, business, or other personal use. Whatever you’re looking for, Xelfcon helps you find the right space that fits your needs.",
        align: "right",
      },
      {
        title: "Earn monthly as a caretaker",
        body:
          "Start earning a monthly income by managing a property assigned to you. Your job can include routine weekly checks, responding to tenant complaints, reporting issues, and ensuring repairs are handled properly.",
        align: "left",
      },
    ],
    []
  );

  const faqItems = useMemo<FaqItem[]>(
    () => [
      {
        q: "What can I do on the Xelfcon app as a property owner?",
        a: "You can list your property for rent, manage tenant information, and assign a caretaker to handle complaints, routine checks, and repairs. The app helps you stay organized without needing to be physically present.",
      },
      {
        q: "What kind of spaces can renters find on Xelfcon?",
        a: "Renters can find rooms, apartments, houses, and other rentable spaces. Depending on your listings, this may also include land for business or personal use.",
      },
      {
        q: "How do I earn money through the caretaker program?",
        a: "If you’re approved and assigned to manage a property, you can earn a monthly income by performing agreed tasks like checks, issue reporting, and coordinating repairs.",
      },
      {
        q: "As a caretaker do I have to work every day?",
        a: "No. Care tasks are typically scheduled (e.g., weekly checks) plus responding when issues occur. The exact schedule depends on the property owner’s agreement.",
      },
      {
        q: "Can I list more than one property on Xelfcon?",
        a: "Yes. You can list multiple properties and manage them within your account, depending on your plan and verification requirements.",
      },
    ],
    []
  );

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-30 bg-[linear-gradient(160deg,#071120_0%,#0d1c33_35%,#102548_58%,#0a1222_100%)]" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1100px_540px_at_50%_-8%,rgba(77,173,255,0.35),rgba(14,23,40,0.05)_45%,rgba(0,0,0,0)_70%)]" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(760px_460px_at_10%_75%,rgba(106,69,255,0.22),rgba(0,0,0,0)_72%)]" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(700px_420px_at_90%_30%,rgba(41,222,255,0.18),rgba(0,0,0,0)_70%)]" />
      <div className="fixed inset-0 -z-10 opacity-45 blur-2xl bg-[conic-gradient(from_210deg_at_50%_45%,rgba(255,255,255,0.08),rgba(255,255,255,0)_25%,rgba(96,165,250,0.12)_55%,rgba(255,255,255,0)_78%,rgba(255,255,255,0.08))]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(2,8,18,0.85),rgba(2,8,18,0)_45%)]" />

      {/* Top nav */}
      <header className="animate-header sticky top-0 z-30 border-b border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="container-page flex items-center justify-between py-4">
          <LogoMark />

          <nav className="hidden items-center gap-2 text-sm text-white/80 md:flex">
            <a href="#features" className="rounded-full px-4 py-2 transition-colors duration-300 hover:bg-white/10 hover:text-white">Features</a>
            <a href="#more" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white">More</a>
            <a href="#faq" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" aria-label="X" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-all hover:opacity-100">
              <Image
                src="/decor/x.png"
                alt="X"
                width={24}
                height={24}
                className="h-5 w-5"
              />
            </a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-all hover:opacity-100">
              <Image
                src="/decor/instagram.png"
                alt="Instagram"
                width={24}
                height={24}
                className="h-5 w-5"
              />
            </a>
            <a href="#" aria-label="TikTok" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-all hover:opacity-100">
              <Image
                src="/decor/tiktok.png"
                alt="TikTok"
                width={24}
                height={24}
                className="h-5 w-5"
              />
            </a>
            <a href="#" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-all hover:opacity-100">
              <Image
                src="/decor/youtube.png"
                alt="YouTube"
                width={24}
                height={24}
                className="h-5 w-5"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pb-14 pt-12 md:pb-16 md:pt-16">
        {/* Transparent faded background image */}
        <div className="absolute inset-0 -z-20 flex items-center justify-center">
          <Image
            src="/decor/atobue-mark.png"
            alt=""
            width={800}
            height={800}
            className="animate-hero-mark h-auto w-full max-w-[600px] scale-75 object-contain opacity-20 md:max-w-[800px] md:scale-100 md:opacity-30"
            priority
            aria-hidden="true"
          />
        </div>
        {/* Black overlay */}
        <div className="absolute inset-0 -z-10 bg-black/40 md:bg-black/30" aria-hidden="true" />
        
        <div className="container-page relative z-10">
          
          <div className="hero-stagger relative mx-auto max-w-[760px] text-center">




            <div className="pill mx-auto border border-white/10 bg-white/8 px-4 py-1.5 text-white/80">Xelfcon</div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight md:text-6xl">
              List, Manage, Rent <br className="hidden md:block" /> & Earn with{" "}
              <span className="text-(--brand)">Xelfcon</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-white/70 md:text-base">
              A modern property platform built to help owners, renters, and caretakers work together with less stress and better visibility.
            </p>

            <DropletPanel />
          </div>
        </div>
      </section>

      {/* Features title */}
      <section id="features" className="mt-10 md:mt-14">
        <Reveal className="container-page">
          <h2 className="section-title">Features</h2>
          <div className="animate-underline underline" />
        </Reveal>
      </section>

      {/* Feature rows */}
      {features.map((f, index) => (
        <FeatureRow key={f.title} item={f} index={index} />
      ))}

      {/* More about */}
      <section id="more" className="mt-16 md:mt-22">
        <div className="container-page">
          <Reveal>
            <h2 className="section-title">More about Xelfcon</h2>
            <div className="animate-underline underline" />
          </Reveal>

          <Reveal delay={120} className="mt-10">
          <div className="grid items-center gap-10 rounded-3xl border border-white/10 bg-white/3 p-5 shadow-soft backdrop-blur transition-transform duration-500 hover:-translate-y-1 md:grid-cols-2 md:gap-12 md:p-7">
            <div className="flex justify-center md:justify-start">
              <div className="relative h-[320px] w-full max-w-[520px]">
                <div className="absolute left-0 top-8 h-[280px] w-[140px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/xelfcon-more-1.png"
                    alt="Phone mockup"
                    width={140}
                    height={280}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-20 top-4 h-[300px] w-[150px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/xelfcon-more-2.png"
                    alt="Phone mockup"
                    width={150}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-40 top-8 h-[280px] w-[140px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/xelfcon-more-3.png"
                    alt="Phone mockup"
                    width={140}
                    height={280}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-60 top-6 h-[290px] w-[145px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/xelfcon-more-4.png"
                    alt="Phone mockup"
                    width={145}
                    height={290}
                    className="h-full w-full object-cover"
                  />
                </div>

                
                <div className="absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,179,255,0.20),rgba(0,0,0,0)_65%)]" />
              </div>
            </div>

            <div className="md:pr-4">
              <BulletHeading text="Everything you need in one place" />
              <p className="mt-3 text-sm leading-7 text-white/75 md:text-[15px]">
                Whether you’re renting, managing, or working, Xelfcon brings it all together in one simple app.
                Property owners can list and manage rental spaces, track tenants, and assign caretakers to handle
                complaints and repairs. Renters can find rooms, houses, apartments, or land. Caretakers can earn
                monthly by helping owners with checks and issue follow-ups.
              </p>
              <div className="mt-5">
                <StoreButtons />
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-18 pb-16 md:mt-24">
        <Reveal className="container-page">
          <Faq items={faqItems} />
        </Reveal>
      </section>

      {/* Footer download + socials */}
      <footer className="border-t border-white/10 bg-black/45">
        <Reveal className="container-page py-12">
          <h3 className="text-center text-lg font-semibold text-white/90">
            What are you waiting for? Download Now!
          </h3>

          <div className="mt-4">
            <StoreButtons className="justify-center" />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-7 md:flex-row">
            <div className="text-xs text-white/50">© Xelfcon 2024</div>
            <div className="flex items-center gap-4 text-white/70">
              <a href="#" aria-label="X" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-opacity hover:opacity-100">
                <Image src="/decor/x.png" alt="X" width={20} height={20} className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-opacity hover:opacity-100">
                <Image src="/decor/instagram.png" alt="Instagram" width={20} height={20} className="h-4 w-4" />
              </a>
              <a href="#" aria-label="TikTok" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-opacity hover:opacity-100">
                <Image src="/decor/tiktok.png" alt="TikTok" width={20} height={20} className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-opacity hover:opacity-100">
                <Image src="/decor/youtube.png" alt="YouTube" width={20} height={20} className="h-4 w-4" />
              </a>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/50">
              <a className="hover:text-white/80" href="#">Privacy Policies</a>
              <a className="hover:text-white/80" href="#">Terms &amp; Conditions</a>
              <a className="hover:text-white/80" href="#">Cookie Policy</a>
            </div>
          </div>
        </Reveal>
      </footer>
    </main>
  );
}
