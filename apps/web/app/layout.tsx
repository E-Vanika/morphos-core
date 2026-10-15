import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_KIND === "bridal" ? "Monika Glam Up | Bridal Makeup & Hairstyling" : "Crafts by Vani | Custom Art & Gifts",
  description: process.env.NEXT_PUBLIC_SITE_KIND === "bridal" ? "Personalised bridal makeup, hairstyling and saree draping by Monika Glam Up." : "Custom portraits, embroidery, paintings and handmade gifts by Crafts by Vani.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
