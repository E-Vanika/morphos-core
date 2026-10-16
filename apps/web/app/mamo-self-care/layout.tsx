import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mamo Self Care | Beauty Services at Home",
  description: "Explore Mamo Self Care facials, waxing, manicure, pedicure, massage, and value combos with clear pricing.",
};

export default function SelfCareLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
