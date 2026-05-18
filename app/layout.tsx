import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xelfcon | List, Manage, Rent & Earn",
  description: "Digitize your property, find verified rentals fast, or become a caretaker and start earning.",
  icons: {
    icon: "/decor/xelfcon-logo.png",
    shortcut: "/decor/xelfcon-logo.png",
    apple: "/decor/xelfcon-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
