"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChatWidget } from "./components/chat-widget";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";
const brand = isBridal ? {
  service: "bridal-makeup", name: "Monika Glam Up", eyebrow: "BRIDAL · ENGAGEMENT · PARTY MAKEUP", title: <>Glow for your<br/><i>special day.</i></>, description: "Bridal makeup and elegant hairstyling, personalised for every celebration.", instagram: "https://www.instagram.com/monika_glamup?igsh=MXV1dXRhMGE1dm1kNQ==", label: "Bridal looks & hairstyling", details: "Function type, event date, location, number of people…", prices: [["Bridal Makeup", "₹8,000"], ["Pre-Bridal Get Ready Package", "₹10,000"], ["Bridesmaid Makeup", "₹4,000"], ["Saree Draping", "₹2,000"], ["Saree Pre-pleating", "₹500"]]
} : {
  service: "art-craft", name: "Crafts by Vani", eyebrow: "HANDMADE GIFTS · CUSTOM ART · CREATIVE DETAILS", title: <>Made with<br/><i>heart.</i></>, description: "Custom handmade gifts, portraits, hoops, décor and thoughtful keepsakes.", instagram: "https://www.instagram.com/crafts.by.vani?igsh=MXUxZjE5aWZveHlxZg%3D%3D&utm_source=qr", label: "Custom handmade creations", details: "Occasion, preferred colours, quantity, budget and delivery date…", prices: [["Pencil Art", "₹3,000"], ["Embroidery", "₹2,000"], ["Painting", "₹1,000"], ["Custom work", "Varies by design"]]
};
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

const FALLBACK_GALLERY_IMAGES = {
  craft: [
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.31.17%20PM%20(1).jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS4zMS4xNyBQTSAoMSkuanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MTM0NTksImV4cCI6MTgxNjM0OTQ1OX0.OlOsEWXng27pPVtIWJ8N3a1mIqD94wWaSNidqk9sb68",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.31.17%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS4zMS4xNyBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzUyNywiZXhwIjoxODE2MzQ5NTI3fQ.bYmtbUW9uqD7K2glY_7IgkDCWFRi79tmIVrY0eQn7F0",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.40.21%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS40MC4yMSBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzU0NiwiZXhwIjoxODE2MzQ5NTQ2fQ.97vfZ1qaH8T2TQXCQVqzWOQGH4ZjRZLiG6jooGD1ifM",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.40.22%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS40MC4yMiBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzU3MywiZXhwIjoxODE2MzQ5NTczfQ.VNoQeOSHluvq5sts7ZfL5VFhvXqNjospoW25_GXA4pM",
  ],
  bridal: [
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.01%20PM.jpeg",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.02%20PM%20(1).jpeg",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.02%20PM.jpeg",
    "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.38.39%20PM%20(1).jpeg",
  ],
};

export default function Home() {
  const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]); const [galleryMessage, setGalleryMessage] = useState("");
  const fallbackImages = isBridal ? FALLBACK_GALLERY_IMAGES.bridal : FALLBACK_GALLERY_IMAGES.craft;
  const displayedImages = images.length ? images : fallbackImages;
  useEffect(() => { fetch(`${apiUrl}/v1/gallery?site=${isBridal ? "bridal" : "craft"}`).then(async response => response.ok ? response.json() : Promise.reject()).then(data => { setImages(data.images ?? []); if (!data.images?.length) setGalleryMessage("Photos will appear here shortly."); }).catch(() => setGalleryMessage("Gallery is being prepared. Please visit Instagram to see the latest work.")); }, []);
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
    <section id="prices" className="section"><p className="eyebrow">STARTING PRICES</p><h2>Simple, clear<br/>pricing.</h2><div className="price-grid">{brand.prices.map(([name, price]) => <div className="price-card" key={name}><span>{name}</span><strong>{price}</strong></div>)}</div><p className="price-note">Final quote may vary based on custom requirements, materials, date and location.</p></section>
    <section id="work" className="work-section"><div><p className="eyebrow">MY WORK</p><h2>Made for<br/>real moments.</h2><p>Browse recent work and customer creations.</p><a className="text-button" href={brand.instagram} target="_blank" rel="noreferrer">Visit Instagram →</a></div><div className="gallery">{displayedImages.length ? displayedImages.map(image => <a href={brand.instagram} target="_blank" rel="noreferrer" key={image}><img src={image} alt={`${brand.name} portfolio work`}/></a>) : <div className={`portfolio-cover ${isBridal ? "bridal-cover" : "craft-cover"}`}><span>{brand.label}</span><small>{galleryMessage || "Photos will appear after upload"}</small></div>}</div></section>
    <section id="order" className="order-section"><div><p className="eyebrow">MAKE AN ENQUIRY</p><h2>Let&apos;s create<br/>something lovely.</h2><p>Send your details and requirements. Your request is saved securely and we will contact you shortly.</p></div><form className="order-form" onSubmit={submitOrder}><label>Service<input value={isBridal ? "Bridal Makeup" : "Art & Craft"} readOnly/></label><label>Your name<input name="name" required placeholder="Your name"/></label><label>Phone / WhatsApp<input name="phone" required placeholder="Your phone number"/></label><label>Event or required date<input name="date" type="date"/></label><label>Tell us what you need<textarea name="details" rows={4} placeholder={brand.details}/></label><button className="button" disabled={submitting}>{submitting ? "Sending…" : "Submit request"}</button>{status && <p className="form-status">{status}</p>}</form></section>
    <footer>{brand.name} · <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a></footer><ChatWidget />
  </main>;
}
