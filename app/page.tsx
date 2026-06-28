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

type FaqCategory = {
  title: string;
  items: FaqItem[];
};

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Account & Verification",
    items: [
      {
        q: "1. How do I create an account on Xelfcon?",
        a: "Tap Create Account on the welcome screen and sign up with your email and password. We send a 6 digit verification code to your email. Enter it on the OTP screen to verify your account.\n\nAfter verification, complete your profile with your first name, last name, phone number, and country of residence. You can then sign in and start using the app.",
      },
      {
        q: "2. Do I need a password to log in?",
        a: "Yes. Xelfcon uses email and password sign in. Enter your credentials on the login screen to access your account.\n\nAfter your first successful login, you may be prompted to enable Face ID or fingerprint login on supported devices for faster access next time.",
      },
      {
        q: "3. I forgot my password. How do I reset it?",
        a: "On the login screen, tap Forgot password? and enter your registered email. We send a reset code to your inbox.\n\nEnter the code on the OTP screen, then set a new password. Once updated, sign in with your new password.",
      },
      {
        q: "4. I can't access my email anymore. What should I do?",
        a: "If you no longer have access to the email on your account, contact our support team so we can help verify your identity and recover access.\n\nGo to More → Support → Contact support, or email support@atobue.com with your full name and a valid means of identification.",
      },
      {
        q: "5. What does it mean to be a verified user?",
        a: "A verified user has completed identity checks in the app. This is separate from creating an account or signing in.\n\nGo to More → Verification to submit your identification number, a government issued ID (passport, national ID, or driver's license), and a selfie. Once approved, you can create property workspaces and join the caretaker program.",
      },
      {
        q: "6. How do I complete identity verification?",
        a: "Open More → Verification and follow the steps in order:\n\n1. Save your identification number (based on your country of residence)\n2. Choose a document type and upload or scan your ID\n3. Take and upload a selfie for facial verification\n4. Submit for review\n\nYou can track pending, approved, or declined status on the same screen. If declined, follow the prompts to upload your documents again.",
      },
      {
        q: "7. Why do I need to verify before listing properties?",
        a: "Identity verification helps keep rentals and payouts trustworthy. You must be verified before you can create a property workspace in Hub.\n\nIf verification is still under review, workspace creation stays paused until your documents are approved.",
      },
      {
        q: "8. How do I add a payout bank account?",
        a: "Go to More → Payout bank account. Select your bank, enter your 10 digit account number, and confirm the resolved account name.\n\nYour payout bank is used for rental income and caretaker earnings. You can view or update it anytime from the Wallet screen.",
      },
    ],
  },
  {
    title: "Properties & Vacancies",
    items: [
      {
        q: "1. What is a property workspace?",
        a: "A workspace is your management hub for one property, like a building or rental portfolio at a single address. Each workspace has its own dashboard where you list units, manage tenants, assign a caretaker, and track transactions.",
      },
      {
        q: "2. How do I create a property workspace?",
        a: 'Open the Hub tab, switch to the Workspace section, and tap Create a property Workspace (or use the + icon in the header).\n\nEnter a workspace name, search for the property address or use your current location to pin it on the map, and rate electricity and drainage quality. For UK properties, you can also add EPC and council tax band details.\n\nIdentity verification must be approved before you can create a workspace.',
      },
      {
        q: "3. Can I manage more than one property?",
        a: "Yes. You can create multiple workspaces, one per property. Each appears as a card in Hub → Workspace. Tap a card to open that property's management dashboard.",
      },
      {
        q: "4. What is a unit vacancy?",
        a: "A vacancy is a rentable unit inside your workspace, such as a room, flat, or apartment. Tenants discover published vacancies on the Find tab and can send enquiries from there.",
      },
      {
        q: "5. How do I list a unit vacancy?",
        a: "Open your workspace from Hub → Workspace, then tap List a unit vacancy. The form walks you through 8 steps:\n\n1. Unit details (category, title, description)\n2. Current tenant (if the unit is already occupied)\n3. Amenities\n4. Services\n5. Features (e.g. water source)\n6. Pricing (rent, caution fee, legal agreement fee)\n7. Rooms and layout (bedrooms, bathrooms, shared spaces)\n8. Photos (3 to 7 images)\n\nSubmit when all required steps are complete. Your listing can then appear on Explore.",
      },
      {
        q: "6. Can I edit a vacancy after publishing?",
        a: "Yes. Open the workspace, go to your listings, and select the unit to edit. Some fields may be locked once a tenant agreement is in place, for example if the listing status is already agreed.",
      },
      {
        q: "7. What can I do from the workspace dashboard?",
        a: "As a property owner, your dashboard includes tools such as:\n\n• List a unit vacancy\n• Maintenance requests and repairs\n• My caretaker (hire or manage)\n• Tenants and occupancy\n• Transactions\n• Message all tenants\n\nAvailable options depend on your role in that workspace.",
      },
    ],
  },
  {
    title: "Caretaker Program",
    items: [
      {
        q: "1. What is the caretaker program?",
        a: "The caretaker program lets verified users offer property management services and get hired by landlords. Caretakers help with day to day tasks such as tenant coordination, maintenance follow up, and property oversight.",
      },
      {
        q: "2. How do I join as a caretaker?",
        a: 'Go to More → Caretaker program. You must complete identity verification first.\n\nTap to enroll and provide your service location (use "Use my current location" or enter your address), your monthly service fee, and a short bio describing your experience. Submit to activate your caretaker profile.',
      },
      {
        q: "3. How do landlords hire a caretaker?",
        a: "From a property workspace, open My caretaker. Browse available caretakers near the property, review their profile, service fee, and bio, then tap Hire caretaker to send a request.\n\nOnce approved, the caretaker gains access to that workspace with caretaker level permissions.",
      },
      {
        q: "4. What can a caretaker do in a workspace?",
        a: "Hired caretakers can access management tools such as maintenance requests, tenant records, transactions, and messaging, depending on what the landlord has enabled for that property.\n\nCaretakers cannot perform owner only actions such as listing new vacancies unless they also hold an owner role.",
      },
      {
        q: "5. Can I update my caretaker profile later?",
        a: "Yes. Return to More → Caretaker program to update your location, service fee, or bio. Your caretaker ID stays the same and can be shared with landlords who want to find you on the platform.",
      },
    ],
  },
  {
    title: "Tenants and Enquiries",
    items: [
      {
        q: "1. How do I find properties to rent?",
        a: "Use the Find tab to browse available vacancies near you. Allow location access for nearby results, or browse the full list.\n\nTap a listing to view photos, pricing, amenities, and nearby places before making an enquiry.",
      },
      {
        q: "2. How do I send an enquiry on a vacancy?",
        a: "Open a vacancy on the Find tab and tap Make enquiries. This creates an enquiry linked to that unit and adds it to Hub → Enquiries so you can track progress.\n\nIf you already enquired on the same vacancy, the app will let you know and take you to your existing enquiry instead of creating a duplicate.",
      },
      {
        q: "3. Where do I track my enquiries?",
        a: "All enquiries live in Hub → Enquiries. Switch between All, Active, and other filters to find what you need.\n\nTenants see their outgoing enquiries; landlords and caretakers see enquiries received on their properties.",
      },
      {
        q: "4. What is the commitment fee?",
        a: "The commitment fee locks a vacancy to you while your enquiry is being processed, so other seekers cannot outbook you.\n\nIt forms part of your rent if the agreement goes through. If the agreement is not completed, the commitment fee is fully refundable. Tap the info note on the payment screen for full details.",
      },
      {
        q: "5. How do I save listings for later?",
        a: "Tap the heart icon on a vacancy in Find or on the property details screen to save it. View all saved listings under More → Saved interests.\n\nRemove a saved listing anytime by tapping the heart again or unsaving from the Saved interests screen.",
      },
      {
        q: "6. How do I message about an enquiry?",
        a: "Use the Mail tab for conversations tied to your enquiries and property activity. You can also schedule property viewings and continue discussions with landlords or caretakers from within an enquiry.",
      },
    ],
  },
  {
    title: "Payments & Earnings",
    items: [
      {
        q: "1. Where do I manage my wallet and payouts?",
        a: "Go to More → Payout bank account to open your Wallet. Here you can see your balance, payout destination, and transaction history, and manage the bank account linked for withdrawals.",
      },
      {
        q: "2. How do I add or change my payout bank?",
        a: "From Wallet, tap to add or manage your payout bank. Choose your bank from the list, enter your account number, and confirm the account name returned by the bank lookup.\n\nYou need a verified payout bank before rental income or caretaker earnings can be paid out to you.",
      },
      {
        q: "3. What is the commitment fee and when do I pay it?",
        a: "After sending an enquiry, you may be asked to pay a commitment fee to secure the vacancy. Payment opens in a secure checkout flow inside the app.\n\nThe fee is applied toward your rent if you proceed, and is refundable if the agreement does not complete.",
      },
      {
        q: "4. How do rent payments work for tenants?",
        a: "Once your tenancy is approved, rent and related charges appear in your enquiry and tenancy flow. Follow the in app prompts to pay rent when due.\n\nYour Hub → Enquiries view shows payment status, including whether a commitment fee has been paid.",
      },
      {
        q: "5. Where do landlords see property income?",
        a: "Open a workspace and go to Transactions to review payments linked to that property. Tenant records also show rent status, commitment fees, and amounts still due.",
      },
    ],
  },
  {
    title: "Notifications & Alerts",
    items: [
      {
        q: "1. How do I turn push notifications on or off?",
        a: "Go to More → Settings and use the Push notifications toggle. When enabled, the app registers your device for alerts about messages, property activity, and other updates.\n\nWhen disabled, your device is removed from push delivery and you will not receive remote alerts.",
      },
      {
        q: "2. Why am I not receiving notifications?",
        a: "Check three things:\n\n1. Push notifications are enabled in More → Settings\n2. Notification permission is allowed in your phone's system settings for Xelfcon\n3. You are signed in on a real device (push may not work on simulators)\n\nIf all of the above look correct, try toggling notifications off and on again.",
      },
      {
        q: "3. What kinds of alerts will I receive?",
        a: "Push notifications cover activity such as new messages in Mail, enquiry updates, property and tenancy events, and other time sensitive actions that need your attention while you are away from the app.",
      },
    ],
  },
  {
    title: "Property Roles & Permissions",
    items: [
      {
        q: "1. What roles exist in a property workspace?",
        a: "Each workspace assigns you a role:\n\n• Owner: full control over listings, tenants, caretakers, and finances\n• Caretaker: day to day management tools for an assigned property\n• Tenant: access to your tenancy, repairs, and rent related actions\n\nYour role is shown on the workspace card in Hub.",
      },
      {
        q: "2. What can a property owner do?",
        a: "Owners can create and edit vacancies, review enquiries, hire caretakers, manage tenants, view transactions, and send messages to tenants. Owners see the full workspace dashboard.",
      },
      {
        q: "3. What can a caretaker see and do?",
        a: "Caretakers invited to a property can handle maintenance requests, view tenant records, access transactions, and message tenants, but they do not get owner only tools such as listing new vacancies unless they are also the owner.",
      },
      {
        q: "4. What can a tenant see in a workspace?",
        a: "Tenants see tenancy focused options such as their unit details, repair requests, rent information, and ways to contact the landlord. Management tools like listing vacancies or hiring caretakers are hidden for tenant roles.",
      },
      {
        q: "5. How do I switch between properties?",
        a: "Go to Hub → Workspace and tap the property card you want to manage. The app remembers your active property and opens the dashboard with the correct role and permissions for that workspace.",
      },
    ],
  },
  {
    title: "General Use & Troubleshooting",
    items: [
      {
        q: "1. What are the main sections of the app?",
        a: "The bottom navigation has five tabs:\n\n• Find: browse and enquire on vacancies\n• Hub: track enquiries and manage property workspaces\n• Assistant: chat with the Xelfcon assistant for help finding homes\n• Mail: conversations and messages\n• More: account, verification, wallet, settings, and support",
      },
      {
        q: "2. How do I update my profile or password?",
        a: "Go to More → Account to view and edit your profile details.\n\nTo change your password, open More → Settings → Update password. You must be signed in to update it.",
      },
      {
        q: "3. The app asks for location access. Why?",
        a: "Location is used to show properties near you on Find, autofill addresses when setting up a workspace or caretaker profile, and improve search results. You can deny permission and still browse listings, but nearby sorting and address autofill may be limited.",
      },
      {
        q: "4. I cannot create a workspace. What should I check?",
        a: 'Common reasons:\n\n• Identity verification is not yet approved: complete More → Verification and wait for review\n• The property address is not pinned: select an address from suggestions or tap "Use my current location"\n• Required fields are missing: workspace name, address, electricity rating, and drainage rating are all required',
      },
      {
        q: "5. How do I get help if my question is not answered here?",
        a: "Go to More → Support. Tap Contact support to email support@xelfcon.com, or browse the other FAQ topics for guides on accounts, properties, payments, and more.",
      },
    ],
  },
];

const SOCIAL_HANDLE = "Xelfcon";

const SOCIAL_LINKS = {
  x: `https://x.com/${SOCIAL_HANDLE}`,
  instagram: `https://instagram.com/${SOCIAL_HANDLE}`,
  tiktok: `https://tiktok.com/@${SOCIAL_HANDLE}`,
  youtube: `https://youtube.com/@${SOCIAL_HANDLE}`,
} as const;

function SocialLinks({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const buttonClass =
    size === "sm"
      ? "grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-opacity hover:opacity-100"
      : "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 opacity-80 transition-all hover:opacity-100";
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const iconSize = size === "sm" ? 20 : 24;

  const items = [
    { href: SOCIAL_LINKS.x, label: "X", src: "/decor/x.png", alt: "X" },
    { href: SOCIAL_LINKS.instagram, label: "Instagram", src: "/decor/instagram.png", alt: "Instagram" },
    { href: SOCIAL_LINKS.tiktok, label: "TikTok", src: "/decor/tiktok.png", alt: "TikTok" },
    { href: SOCIAL_LINKS.youtube, label: "YouTube", src: "/decor/youtube.png", alt: "YouTube" },
  ] as const;

  return (
    <div className={`flex items-center ${size === "sm" ? "gap-4" : "gap-3"} ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className={buttonClass}
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={iconSize}
            height={iconSize}
            className={iconClass}
          />
        </a>
      ))}
    </div>
  );
}

function LogoMark() {
  return (
    <Image
      src="/decor/xelfcon-logo.png"
      alt="Xelfcon Logo"
      width={36}
      height={36}
      className="h-9 w-9 rounded-lg transition-transform duration-300 hover:scale-[1.02] md:h-10 md:w-10"
    />
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
            className="h-[50px] w-auto"
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
    <div className="relative mx-auto h-[460px] w-full max-w-[300px] md:mx-0 md:h-[520px] md:max-w-[340px]">
      <div
        className={[
          "animate-phone-back absolute top-14 z-10 h-[360px] w-[180px] md:top-16 md:h-[400px] md:w-[200px]",
          isLeft 
            ? "left-[calc(50%-100px)] md:left-0" 
            : "left-[calc(50%-80px)] md:left-auto md:right-0",
        ].join(" ")}
      >
        <div className="h-full w-full rotate-[-4deg] overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-soft">
          <Image
            src={backImage}
            alt="Phone mockup"
            width={200}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div
        className={[
          "animate-phone-front absolute top-3 z-20 h-[390px] w-[195px] md:top-4 md:h-[430px] md:w-[215px]",
          isLeft 
            ? "left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0" 
            : "left-1/2 -translate-x-1/2 md:right-12 md:translate-x-0",
        ].join(" ")}
      >
        <div className="h-full w-full rotate-3 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-soft">
          <Image
            src={frontImage}
            alt="Phone mockup"
            width={215}
            height={430}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="animate-float-glow absolute inset-0 z-0 rounded-3xl bg-(--brand)/20 opacity-60 blur-3xl" />
    </div>
  );
}

function MorePhoneStack() {
  const phones = [
    {
      src: "/decor/xelfcon-more-1.png",
      className:
        "animate-phone-back absolute left-0 top-10 z-10 h-[300px] w-[150px] md:top-16 md:h-[400px] md:w-[200px]",
      rotate: "-rotate-[4deg]",
    },
    {
      src: "/decor/xelfcon-more-2.png",
      className:
        "animate-phone-front absolute left-12 top-3 z-20 h-[320px] w-[160px] md:left-18 md:top-4 md:h-[430px] md:w-[215px]",
      rotate: "rotate-3",
    },
    {
      src: "/decor/xelfcon-more-3.png",
      className:
        "animate-phone-back absolute left-24 top-10 z-30 h-[300px] w-[150px] md:left-36 md:top-16 md:h-[400px] md:w-[200px]",
      rotate: "-rotate-[4deg]",
    },
    {
      src: "/decor/xelfcon-more-4.png",
      className:
        "animate-phone-front absolute left-36 top-6 z-40 h-[310px] w-[155px] md:left-54 md:top-8 md:h-[430px] md:w-[215px]",
      rotate: "rotate-3",
    },
  ] as const;

  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[300px] md:mx-0 md:h-[520px] md:max-w-[430px]">
      {phones.map((phone) => (
        <div key={phone.src} className={phone.className}>
          <div className={`h-full w-full overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-soft ${phone.rotate}`}>
            <Image
              src={phone.src}
              alt="Phone mockup"
              width={215}
              height={430}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ))}
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
      return { back: "/decor/xelfcon-caretaker-feature-back.png", front: "/decor/xelfcon-caretaker-feature-front.png" };
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
          List your property, find a place to rent, or pick up caretaker work. It is all in one app.
        </p>
        <StoreButtons className="mt-5 justify-center" />
      </div>
    </div>
  );
}

function Faq({ categories }: { categories: FaqCategory[] }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number>(0);

  const items = categories[activeCategory]?.items ?? [];

  useEffect(() => {
    setOpenIndex(0);
  }, [activeCategory]);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-10">
      <Reveal variant="slide-right">
        <h2 className="text-2xl font-semibold md:text-3xl">Faq</h2>
        <div className="mt-2 h-1 w-12 rounded-full bg-(--brand)" />
        <p className="mt-4 max-w-[340px] text-sm leading-7 text-white/70">
          Common questions about listing, renting, managing, or earning on Xelfcon.
        </p>
      </Reveal>

      <div className="space-y-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat, idx) => {
            const isActive = idx === activeCategory;
            return (
              <button
                key={cat.title}
                type="button"
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/50 hover:text-white/80",
                ].join(" ")}
                onClick={() => setActiveCategory(idx)}
                aria-pressed={isActive}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        <div>
          {items.map((it, idx) => {
            const isOpen = idx === openIndex;
            return (
              <Reveal key={it.q} variant="fade-up" delay={idx * 60}>
                <div className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-white"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-medium transition-colors ${isOpen ? "text-white" : "text-white/85"}`}>
                      {it.q}
                    </span>
                    <span className={`shrink-0 text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180 text-white/70" : ""}`}>
                      ▾
                    </span>
                  </button>

                  <div className={`faq-answer ${isOpen ? "faq-answer-open" : ""}`}>
                    <div className="faq-answer-inner">
                      <div className="whitespace-pre-line pb-4 text-sm leading-6 text-white/60">{it.a}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
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
          "Got a place to rent out? Add your property, list whatever space is free, keep an eye on tenants, and bring in a caretaker if you want help with the day to day. You stay in charge without running around.",
        align: "left",
      },
      {
        title: "Looking for a place? Start here",
        body:
          "Need somewhere to live? Look through rooms, apartments, condos, and full houses on Xelfcon. Narrow it down by area and price, see what is included, and message the landlord when you find a fit.",
        align: "right",
      },
      {
        title: "Earn monthly as a caretaker",
        body:
          "Caretakers get paid each month to look after a property an owner assigns them. That might mean weekly checks, answering tenant messages, flagging problems, and making sure repairs actually get done.",
        align: "left",
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

          <SocialLinks />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pb-14 pt-12 md:pb-16 md:pt-16">
        {/* Logo watermark — soft-light blend + radial fade into hero */}
        <div className="pointer-events-none absolute inset-0 -z-20 flex items-center justify-center">
          <div className="hero-mark-blend animate-hero-mark">
            <Image
              src="/decor/atobue-mark.png"
              alt=""
              width={800}
              height={800}
              className="h-auto w-full max-w-[600px] scale-75 object-contain md:max-w-[800px] md:scale-100"
              priority
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Vignette tuned to page gradient tones */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_85%_at_50%_42%,rgba(77,173,255,0.06)_0%,rgba(16,37,72,0.35)_50%,rgba(7,17,32,0.72)_100%)]"
          aria-hidden="true"
        />
        
        <div className="container-page relative z-10">
          
          <div className="hero-stagger relative mx-auto max-w-[760px] text-center">




            <div className="pill mx-auto border border-white/10 bg-white/8 px-4 py-1.5 text-white/80">Xelfcon</div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight md:text-6xl">
              List, Manage, Rent <br className="hidden md:block" /> & Earn with{" "}
              <span className="text-(--brand)">Xelfcon</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-white/70 md:text-base">
              One app for landlords, renters, and caretakers. List a home, find a rental, or get paid to help look after a building.
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
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <MorePhoneStack />

            <div className="min-w-0 md:pr-4">
              <BulletHeading text="Everything you need in one place" />
              <p className="mt-3 text-sm leading-7 text-white/75 md:text-[15px]">
                Owners list spaces, track tenants, and hand off complaints and repairs to a caretaker when they want to.
                Renters browse rooms, apartments, condos, and houses. Caretakers pick up monthly pay for checks and
                follow ups on whatever property they are assigned to.
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
          <Faq categories={FAQ_CATEGORIES} />
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
            <SocialLinks size="sm" className="text-white/70" />

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
