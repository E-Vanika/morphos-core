/**
 * Public Monika Glam Up prices.
 *
 * Keep every shared price here so the website, AI concierge, RAG knowledge,
 * and MCP service menu always publish the same amount.
 */
export const MONIKA_PRICES = {
  matte: "₹8,000",
  softGlam: "₹9,000",
  skinFinish: "₹10,000",
  glow: "₹12,000",
  bridesmaid: "₹5,000",
  bridesmaidHair: "₹1,500",
  party: "₹3,500",
  bridalHair: "₹2,500",
  sareeDraping: "₹1,000",
  prePleating: "₹600",
} as const;

export type SiteService = { id: string; name: string; price: string; description: string };
export type SiteImage = { id: "hero-main" | "hero-detail" | "experience"; url: string; alt: string };

export const DEFAULT_MONIKA_SERVICES: SiteService[] = [
  { id: "matte", name: "Matte Finish Bridal Look", price: MONIKA_PRICES.matte, description: "A polished, shine-controlled finish with graceful definition." },
  { id: "soft-glam", name: "Soft Glam Bridal Look", price: MONIKA_PRICES.softGlam, description: "Refined eyes, soft radiance and an effortlessly elegant finish." },
  { id: "skin-finish", name: "Skin Finish Bridal Look", price: MONIKA_PRICES.skinFinish, description: "Fresh, skin-like coverage designed to look beautiful in person and on camera." },
  { id: "glow", name: "Glow Finish Bridal Look", price: MONIKA_PRICES.glow, description: "A luminous, dimensional finish for a radiant bridal presence." },
  { id: "bridesmaid", name: "Bridesmaid Package", price: MONIKA_PRICES.bridesmaid, description: "Makeup, hairstyling or hairdo, and saree draping." },
  { id: "party", name: "Party Makeup Package", price: MONIKA_PRICES.party, description: "Makeup and hairstyling for receptions, engagements and special occasions." },
  { id: "hair", name: "Bridal Hairstyling", price: MONIKA_PRICES.bridalHair, description: "Hairdo tailored to your outfit, accessories and event." },
  { id: "draping", name: "Saree Draping", price: MONIKA_PRICES.sareeDraping, description: `Event-ready draping; pre-pleating is available from ${MONIKA_PRICES.prePleating}.` },
];

export const DEFAULT_MONIKA_IMAGES: SiteImage[] = [
  { id: "hero-main", url: "/gallery/bridal-bridesmaid-makeup.jpeg", alt: "Bridal makeup by Monika Glam Up" },
  { id: "hero-detail", url: "/gallery/bridal-hairstyle.jpeg", alt: "Bridal hairstyling detail" },
  { id: "experience", url: "/gallery/bridal-reception-hairstyle.jpeg", alt: "Reception hairstyle by Monika Glam Up" },
];

export function mergeSiteContent(services: SiteService[] = [], images: SiteImage[] = []) {
  const serviceMap = new Map(DEFAULT_MONIKA_SERVICES.map(item => [item.id, item]));
  services.forEach(item => serviceMap.set(item.id, item));
  const imageMap = new Map(DEFAULT_MONIKA_IMAGES.map(item => [item.id, item]));
  images.forEach(item => imageMap.set(item.id, item));
  return { services: [...serviceMap.values()], images: [...imageMap.values()] };
}
