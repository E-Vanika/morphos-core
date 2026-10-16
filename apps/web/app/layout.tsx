import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./brand.css";

const themeScript = `(function(){try{var saved=localStorage.getItem('monika-theme');var theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){}})();`;

const isCraftSite = process.env.NEXT_PUBLIC_SITE_KIND === "craft";

export const metadata: Metadata = {
  title: isCraftSite ? "Crafts by Vani | Custom Art & Gifts" : "Monika Glam Up | Bridal Makeup & Hairstyling",
  description: isCraftSite ? "Custom portraits, embroidery, paintings and handmade gifts by Crafts by Vani." : "Personalised bridal makeup, hairstyling and saree draping by Monika Glam Up.",
  icons: {
    icon: isCraftSite ? "/crafts-by-vani-icon.svg" : "/monika-glamup-icon.svg",
    shortcut: isCraftSite ? "/crafts-by-vani-icon.svg" : "/monika-glamup-icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body>{children}</body></html>;
}
