"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ChatWidget } from "./components/chat-widget";

type GalleryImage = {
  src: string;
  label: string;
};

type ServiceItem = {
  id: string;
  site: "art-craft" | "bridal";
  name: string;
  description?: string;
  price: string;
  active: boolean;
  sort_order: number;
};

type Brand = {
  service: string;
  name: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  instagram: string;
  label: string;
  details: string;
  prices: [string, string][];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";

const bridalBrand: Brand = {
  service: "bridal-makeup",
  name: "Monika Glam Up",
  eyebrow: "BRIDAL · ENGAGEMENT · PARTY MAKEUP",
  title: (
    <>
      Glow for your<br />
      <i>special day.</i>
    </>
  ),
  description: "Bridal makeup and elegant hairstyling, personalised for every celebration.",
  instagram: "https://www.instagram.com/monika_glamup?igsh=MXV1dXRhMGE1dm1kNQ==",
  label: "Bridal looks & hairstyling",
  details: "Function type, event date, location, number of people…",
  prices: [
    ["Bridal Makeup", "₹15,000"],
    ["Pre-Bridal Get Ready Package", "₹10,000"],
    ["Bridesmaid Makeup", "₹4,000"],
    ["Saree Draping", "₹2,000"],
    ["Saree Pre-pleating", "₹500"],
  ],
};

const craftBrand: Brand = {
  service: "art-craft",
  name: "Crafts by Vani",
  eyebrow: "HANDMADE GIFTS · CUSTOM ART · CREATIVE DETAILS",
  title: (
    <>
      Made with<br />
      <i>heart.</i>
    </>
  ),
  description: "Custom handmade gifts, portraits, hoops, décor and thoughtful keepsakes.",
  instagram: "https://www.instagram.com/crafts.by.vani?igsh=MXUxZjE5aWZveHlxZg%3D%3D&utm_source=qr",
  label: "Custom handmade creations",
  details: "Occasion, preferred colours, quantity, budget and delivery date…",
  prices: [
    ["Pencil Art", "₹3,000"],
    ["Embroidery", "₹2,000"],
    ["Painting", "₹1,000"],
    ["Custom work", "Varies by design"],
  ],
};

const brand: Brand = isBridal ? bridalBrand : craftBrand;
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

const FALLBACK_GALLERY_IMAGES: Record<"craft" | "bridal", GalleryImage[]> = {
  craft: [
    { src: "/gallery/pencil-art.jpeg", label: "Pencil art" },
    { src: "/gallery/painting-landscape.jpeg", label: "Painting landscape" },
    { src: "/gallery/pencil-art-cryptography.jpeg", label: "Pencil art cryptography" },
    { src: "/gallery/painting-portrait.jpeg", label: "Painting portrait" },
  ],
  bridal: [
    { src: "/gallery/bridal-bridesmaid-makeup.jpeg", label: "Bridesmaid makeup" },
    { src: "/gallery/bridal-saree-draping.jpeg", label: "Saree draping" },
    { src: "/gallery/bridal-hairstyle.jpeg", label: "Bridal hairstyle" },
    { src: "/gallery/bridal-reception-hairstyle.jpeg", label: "Reception hairstyle" },
  ],
};

export default function Home() {
  const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]); const [galleryMessage, setGalleryMessage] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const fallbackImages = isBridal ? FALLBACK_GALLERY_IMAGES.bridal : FALLBACK_GALLERY_IMAGES.craft;
  const displayedImages = [...fallbackImages, ...images.filter(api => !fallbackImages.some(fallback => fallback.src === api.src))];
  const displayedServices = services.length ? services : brand.prices.map(([name, price]) => ({ id: name, site: isBridal ? "bridal" : "art-craft", name, price, active: true, sort_order: 0 }));

  useEffect(() => {
    fetch(`${apiUrl}/v1/gallery?site=${isBridal ? "bridal" : "craft"}`)
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        const apiImages: GalleryImage[] = (data.images ?? []).map((src: string) => ({ src, label: brand.label }));
        setImages(apiImages);
        if (!data.images?.length) setGalleryMessage("Photos will appear here shortly.");
      })
      .catch(() => setGalleryMessage("Gallery is being prepared. Please visit Instagram to see the latest work."));

    fetch(`${apiUrl}/v1/services?site=${isBridal ? "bridal" : "art-craft"}`)
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(data => setServices(data ?? []))
      .catch(() => {
        /* keep hard-coded list */
      });
  }, []);
  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const payload = { service: brand.service, customer_name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? ""), event_date: String(form.get("date") ?? "") || null, details: String(form.get("details") ?? "") || null };
    setSubmitting(true); setStatus("");
    try { const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(); setStatus("Request received — we will contact you shortly."); event.currentTarget.reset(); if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I submitted a ${brand.name} request. Name: ${payload.customer_name}.`)}`, "_blank", "noopener,noreferrer"); }
    catch { setStatus("Could not submit right now. Please message us on Instagram."); } finally { setSubmitting(false); }
  }
  return <main className={isBridal ? "bridal-site" : "craft-site"}>
    <header><a className="brand" href="#top">{brand.name}<span>✦</span></a><nav><a href="#prices">Prices</a><a href="#work">My work</a><a href="#order">Book now</a></nav><a className="outline" href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a></header>
    <section id="top" className="hero"><p className="eyebrow">{brand.eyebrow}</p><h1>{brand.title}</h1><p className="lede">{brand.description}</p><a className="button" href="#order">Request now</a></section>
    <section id="prices" className="section"><p className="eyebrow">STARTING PRICES</p><h2>Simple, clear<br/>pricing.</h2><div className="price-grid">{displayedServices.map(service => <div className="price-card" key={service.id}><span>{service.name}</span><strong>{service.price}</strong><small>{service.description || "Customised service based on your request."}</small></div>)}</div><p className="price-note">Final quote may vary based on custom requirements, materials, date and location.</p></section>
    <section id="work" className="work-section"><div><p className="eyebrow">MY WORK</p><h2>Made for<br/>real moments.</h2><p>Browse recent work and customer creations.</p><a className="text-button" href={brand.instagram} target="_blank" rel="noreferrer">Visit Instagram →</a></div><div className="gallery">{displayedImages.length ? displayedImages.map(image => <a href={brand.instagram} target="_blank" rel="noreferrer" key={image.src}><img src={image.src} alt={`${brand.name} ${image.label}`} title={image.label}/></a>) : <div className={`portfolio-cover ${isBridal ? "bridal-cover" : "craft-cover"}`}><span>{brand.label}</span><small>{galleryMessage || "Photos will appear after upload"}</small></div>}</div></section>
    <section id="order" className="order-section"><div><p className="eyebrow">MAKE AN ENQUIRY</p><h2>Let&apos;s create<br/>something lovely.</h2><p>Send your details and requirements. Your request is saved securely and we will contact you shortly.</p></div><form className="order-form" onSubmit={submitOrder}><label>Service<input value={isBridal ? "Bridal Makeup" : "Art & Craft"} readOnly/></label><label>Your name<input name="name" required placeholder="Your name"/></label><label>Phone / WhatsApp<input name="phone" required placeholder="Your phone number"/></label><label>Event or required date<input name="date" type="date"/></label><label>Tell us what you need<textarea name="details" rows={4} placeholder={brand.details}/></label><button className="button" disabled={submitting}>{submitting ? "Sending…" : "Submit request"}</button>{status && <p className="form-status">{status}</p>}</form></section>
    <footer>{brand.name} · <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a></footer><ChatWidget />
  </main>;
}
