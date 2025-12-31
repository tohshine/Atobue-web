"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

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
    <div className="flex items-center">
      <Image
        src="/decor/Logo.png"
        alt="Atobue Logo"
        width={120}
        height={40}
        className="h-auto w-auto"
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
        <a href="#" aria-label="Download on the App Store" className="inline-block">
          <Image
            src="/decor/apple.png"
            alt="Download on the App Store"
            width={150}
            height={50}
            className="h-[50px] w-auto"
          />
        </a>
      )}

      {showAndroid && (
        <a href="#" aria-label="Get it on Google Play" className="inline-block">
          <Image
            src="/decor/google.png"
            alt="Get it on Google Play"
            width={150}
            height={50}
            className="h-[50px] w-auto"
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
    <div className="relative h-[340px] w-full max-w-[200px] mx-auto md:mx-0">
      <div
        className={[
          "absolute top-10 h-[280px] w-[140px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft",
          isLeft 
            ? "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0" 
            : "left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0",
        ].join(" ")}
      >
        <Image
          src={backImage}
          alt="Phone mockup"
          width={140}
          height={280}
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className={[
          "absolute top-0 h-[300px] w-[150px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft",
          isLeft 
            ? "left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0" 
            : "left-1/2 -translate-x-1/2 md:right-10 md:translate-x-0",
        ].join(" ")}
      >
        <Image
          src={frontImage}
          alt="Phone mockup"
          width={150}
          height={300}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-40 blur-2xl bg-(--brand)/10" />
    </div>
  );
}

function BulletHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-(--brand)">
      <span className="h-2 w-2 rounded-full bg-(--brand)" />
      <h3 className="text-sm font-semibold md:text-base">{text}</h3>
    </div>
  );
}

function FeatureRow({ item }: { item: Feature }) {
  const isLeft = item.align === "left";
  
  // Determine images based on feature title
  const getImages = (title: string) => {
    if (title.toLowerCase().includes("property") || title.toLowerCase().includes("manage")) {
      return { back: "/decor/landlrd.png", front: "/decor/properties.png" };
    } else if (title.toLowerCase().includes("place") || title.toLowerCase().includes("rent")) {
      return { back: "/decor/Explore.png", front: "/decor/Rent.png" };
    } else if (title.toLowerCase().includes("caretaker") || title.toLowerCase().includes("earn")) {
      return { back: "/decor/properties.png", front: "/decor/caretaker.png" };
    }
    return { back: "/decor/Explore.png", front: "/decor/properties.png" };
  };
  
  const images = getImages(item.title);
  
  return (
    <section className="mt-10 md:mt-14">
      <div className="container-page">
        <div
          className={[
            "grid items-center gap-8 md:gap-10",
            "md:grid-cols-2",
          ].join(" ")}
        >
          <div className={isLeft ? "order-1" : "order-1 md:order-2"}>
            <PhoneStack 
              side={isLeft ? "left" : "right"} 
              backImage={images.back}
              frontImage={images.front}
            />
          </div>

          <div className={isLeft ? "order-2" : "order-2 md:order-1"}>
            <BulletHeading text={item.title} />
            <p className="mt-3 text-sm leading-6 text-white/70 md:text-[15px]">
              {item.body}
            </p>
            <div className="mt-4">
              <StoreButtons />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DropletPanel() {
  return (
    <div className="relative mx-auto mt-6 w-full max-w-[520px]">
      {/* droplet-ish shape */}
      <div className="absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,179,255,0.28),rgba(255,255,255,0.04)_55%,rgba(0,0,0,0)_100%)] opacity-90" />
      <div className="card-soft shadow-soft px-6 py-6 md:px-8 md:py-7">
        <p className="text-center text-sm leading-6 text-white/75 md:text-[15px]">
          Digitize your property, find verified rentals fast, or become a caretaker and start earning in our
          all in one powerful app.
        </p>
        <StoreButtons className="mt-4 justify-center" />
      </div>
    </div>
  );
}

function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:gap-10">
      <div>
        <h2 className="text-2xl font-semibold">Faq</h2>
        <div className="mt-2 h-1 w-12 rounded-full bg-(--brand)" />
        <p className="mt-4 max-w-[320px] text-sm leading-6 text-white/70">
          Got questions? We’ve answered the most common things users ask about using, renting, managing, or earning with Atobue.
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
      </div>

      <div className="space-y-3">
        {items.map((it, idx) => {
          const isOpen = idx === openIndex;
          return (
            <div key={it.q} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <button
                type="button"
                className={[
                  "flex w-full items-center justify-between gap-4 px-4 py-3 text-left",
                  isOpen ? "bg-(--brand)/20" : "hover:bg-white/5",
                ].join(" ")}
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-white/90">{it.q}</span>
                <span className="text-white/70">{isOpen ? "▴" : "▾"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-3 text-sm leading-6 text-white/70">
                  {it.a}
                </div>
              )}
            </div>
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
          "You can easily find places to rent, whether it’s a room, apartment, condo, or an entire house. You can also discover lands available for rent for things like farming, business, or other personal use. Whatever you’re looking for, Atobue helps you find the right space that fits your needs.",
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
        q: "What can I do on the Atobue app as a property owner?",
        a: "You can list your property for rent, manage tenant information, and assign a caretaker to handle complaints, routine checks, and repairs. The app helps you stay organized without needing to be physically present.",
      },
      {
        q: "What kind of spaces can renters find on Atobue?",
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
        q: "Can I list more than one property on Atobue?",
        a: "Yes. You can list multiple properties and manage them within your account, depending on your plan and verification requirements.",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,#111315_0%,#12181b_55%,#0f1113_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-90 bg-[radial-gradient(800px_420px_at_50%_12%,rgba(45,179,255,0.22),rgba(0,0,0,0))]" />

      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/20 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <LogoMark />

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#features" className="hover:text-white">Feature</a>
            <a href="#more" className="hover:text-white">More</a>
            <a href="#faq" className="hover:text-white">Faq</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" aria-label="X" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src="/decor/x.png"
                alt="X"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src="/decor/instagram.png"
                alt="Instagram"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" aria-label="TikTok" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src="/decor/tiktok.png"
                alt="TikTok"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" aria-label="YouTube" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src="/decor/youtube.png"
                alt="YouTube"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-10 md:pt-14 pb-10 md:pb-14 overflow-hidden">
        {/* Transparent faded background image */}
        <div className="absolute inset-0 -z-20 flex items-center justify-center">
          <Image
            src="/decor/atobue-mark.png"
            alt=""
            width={800}
            height={800}
            className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain opacity-20 md:opacity-30 scale-75 md:scale-100"
            priority
            aria-hidden="true"
          />
        </div>
        {/* Black overlay */}
        <div className="absolute inset-0 -z-10 bg-black/40 md:bg-black/30" aria-hidden="true" />
        
        <div className="container-page relative z-10">
          
          <div className="relative mx-auto max-w-[760px] text-center">




            <div className="pill mx-auto">Atobue</div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              List, Manage, Rent <br className="hidden md:block" /> & Earn with{" "}
              <span className="text-(--brand)">Atobue</span>
            </h1>

            <DropletPanel />
          </div>
        </div>
      </section>

      {/* Features title */}
      <section id="features" className="mt-12 md:mt-16">
        <div className="container-page">
          <h2 className="section-title">Features</h2>
          <div className="underline" />
        </div>
      </section>

      {/* Feature rows */}
      {features.map((f) => (
        <FeatureRow key={f.title} item={f} />
      ))}

      {/* More about */}
      <section id="more" className="mt-14 md:mt-20">
        <div className="container-page">
          <h2 className="section-title">More about Atobue</h2>
          <div className="underline" />

          <div className="mt-10 grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="flex justify-center md:justify-start">
              <div className="relative h-[320px] w-full max-w-[520px]">
                <div className="absolute left-0 top-8 h-[280px] w-[140px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/Rent.png"
                    alt="Phone mockup"
                    width={140}
                    height={280}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-20 top-4 h-[300px] w-[150px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/manage.png"
                    alt="Phone mockup"
                    width={150}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-40 top-8 h-[280px] w-[140px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/caretaker.png"
                    alt="Phone mockup"
                    width={140}
                    height={280}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute left-60 top-6 h-[290px] w-[145px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-soft">
                  <Image
                    src="/decor/properties.png"
                    alt="Phone mockup"
                    width={145}
                    height={290}
                    className="h-full w-full object-cover"
                  />
                </div>

                
                <div className="absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(45,179,255,0.20),rgba(0,0,0,0)_65%)]" />
              </div>
            </div>

            <div>
              <BulletHeading text="Everything you need in one place" />
              <p className="mt-3 text-sm leading-6 text-white/70 md:text-[15px]">
                Whether you’re renting, managing, or working, Atobue brings it all together in one simple app.
                Property owners can list and manage rental spaces, track tenants, and assign caretakers to handle
                complaints and repairs. Renters can find rooms, houses, apartments, or land. Caretakers can earn
                monthly by helping owners with checks and issue follow-ups.
              </p>
              <div className="mt-5">
                <StoreButtons />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-16 md:mt-20 pb-16">
        <div className="container-page">
          <Faq items={faqItems} />
        </div>
      </section>

      {/* Footer download + socials */}
      <footer className="border-t border-white/5 bg-black/35">
        <div className="container-page py-12">
          <h3 className="text-center text-lg font-semibold text-white/90">
            What are you waiting for? Download Now!
          </h3>

          <div className="mt-4">
            <StoreButtons className="justify-center" />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-xs text-white/50">© Atobue 2024</div>

            <div className="flex items-center gap-4 text-white/70">
              <a className="hover:text-white" href="#" aria-label="X">𝕏</a>
              <a className="hover:text-white" href="#" aria-label="Instagram">⌁</a>
              <a className="hover:text-white" href="#" aria-label="TikTok">♪</a>
              <a className="hover:text-white" href="#" aria-label="YouTube">▶</a>
              <a className="hover:text-white" href="#" aria-label="LinkedIn">in</a>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/50">
              <a className="hover:text-white/80" href="#">Privacy Policies</a>
              <a className="hover:text-white/80" href="#">Terms &amp; Conditions</a>
              <a className="hover:text-white/80" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
