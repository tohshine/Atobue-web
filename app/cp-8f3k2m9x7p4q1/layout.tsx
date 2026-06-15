import type { Metadata } from "next";
import StoreProvider from "@/lib/store/provider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
