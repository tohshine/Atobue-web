import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xelfcon | List, Manage, Rent & Earn",
  description: "Digitize your property, find verified rentals fast, or become a caretaker and start earning.",
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/decor/xelfcon-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/decor/xelfcon-logo.png",
    apple: "/apple-icon",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
