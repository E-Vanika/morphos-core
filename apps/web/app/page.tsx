"use client";

import { FormEvent, useState } from "react";
import { ChatWidget } from "./components/chat-widget";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";
const brand = isBridal ? {
  service: "bridal-makeup", name: "Monika Glam Up", eyebrow: "BRIDAL · ENGAGEMENT · PARTY MAKEUP", title: <>Glow for your<br/><i>special day.</i></>, description: "Bridal makeup and elegant hairstyling, personalised for every celebration.", instagram: "https://www.instagram.com/monika_glamup?igsh=MXV1dXRhMGE1dm1kNQ==", image: process.env.NEXT_PUBLIC_BRIDAL_IMAGE_URL, label: "Bridal looks & hairstyling", details: "Function type, event date, location, number of people…"
} : {
  service: "art-craft", name: "Crafts by Vani", eyebrow: "HANDMADE GIFTS · CUSTOM ART · CREATIVE DETAILS", title: <>Made with<br/><i>heart.</i></>, description: "Custom handmade gifts, portraits, hoops, décor and thoughtful keepsakes.", instagram: "https://www.instagram.com/crafts.by.vani?igsh=MXUxZjE5aWZveHlxZg%3D%3D&utm_source=qr", image: process.env.NEXT_PUBLIC_ART_IMAGE_URL, label: "Custom handmade creations", details: "Occasion, preferred colours, quantity, budget and delivery date…"
};
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export default function Home() {
  const [status, setStatus] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const payload = { service: brand.service, customer_name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? ""), event_date: String(form.get("date") ?? "") || null, details: String(form.get("details") ?? "") || null };
    setSubmitting(true); setStatus("");
    try { const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(); setStatus("Request received — we will contact you shortly."); event.currentTarget.reset(); if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I submitted a ${brand.name} request. Name: ${payload.customer_name}.`)}`, "_blank", "noopener,noreferrer"); }
    catch { setStatus("Could not submit right now. Please message us on Instagram."); } finally { setSubmitting(false); }
  }
  return <main className={isBridal ? "bridal-site" : "craft-site"}>
    <header><a className="brand" href="#top">{brand.name}<span>✦</span></a><nav><a href="#work">My work</a><a href="#order">Book now</a></nav><a className="outline" href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a></header>
    <section id="top" className="hero"><p className="eyebrow">{brand.eyebrow}</p><h1>{brand.title}</h1><p className="lede">{brand.description}</p><a className="button" href="#order">Request now</a></section>
    <section id="work" className="work-section"><div><p className="eyebrow">INSTAGRAM PORTFOLIO</p><h2>See the work.<br/>Feel the care.</h2><p>Browse recent work, customer creations and more details on Instagram.</p><a className="text-button" href={brand.instagram} target="_blank" rel="noreferrer">Visit {brand.name} on Instagram →</a></div><a className={`portfolio-cover ${isBridal ? "bridal-cover" : "craft-cover"}`} style={brand.image ? { backgroundImage: `url(${brand.image})` } : undefined} href={brand.instagram} target="_blank" rel="noreferrer"><span>{brand.image ? "" : brand.label}</span><small>Open Instagram ↗</small></a></section>
    <section id="order" className="order-section"><div><p className="eyebrow">MAKE AN ENQUIRY</p><h2>Let&apos;s create<br/>something lovely.</h2><p>Send your details and requirements. Your request is saved securely and we will contact you shortly.</p></div><form className="order-form" onSubmit={submitOrder}><label>Service<input value={isBridal ? "Bridal Makeup" : "Art & Craft"} readOnly/></label><label>Your name<input name="name" required placeholder="Your name"/></label><label>Phone / WhatsApp<input name="phone" required placeholder="Your phone number"/></label><label>Event or required date<input name="date" type="date"/></label><label>Tell us what you need<textarea name="details" rows={4} placeholder={brand.details}/></label><button className="button" disabled={submitting}>{submitting ? "Sending…" : "Submit request"}</button>{status && <p className="form-status">{status}</p>}</form></section>
    <footer>{brand.name} · <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a></footer><ChatWidget />
  </main>;
}
