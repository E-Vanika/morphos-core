"use client";

import { FormEvent, useState } from "react";
import { ChatWidget } from "./components/chat-widget";

type Service = "art-craft" | "bridal-makeup";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#";
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
const services: { id: Service; label: string; description: string; image?: string }[] = [
  { id: "art-craft", label: "Art & Craft", description: "Handmade gifts, custom décor, return gifts and creative workshops.", image: process.env.NEXT_PUBLIC_ART_IMAGE_URL },
  { id: "bridal-makeup", label: "Bridal Makeup", description: "Bridal, engagement and party makeup with a look planned around you.", image: process.env.NEXT_PUBLIC_BRIDAL_IMAGE_URL },
];

export default function Home() {
  const [service, setService] = useState<Service>("art-craft");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  function chooseService(value: Service) { setService(value); document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" }); }
  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const payload = { service, customer_name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? ""), event_date: String(form.get("date") ?? "") || null, details: String(form.get("details") ?? "") || null };
    setSubmitting(true); setStatus("");
    try {
      const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Order request failed");
      setStatus("Request received — we will contact you shortly."); event.currentTarget.reset();
      if (whatsappNumber) { const text = encodeURIComponent(`Hello! I submitted a ${services.find(item => item.id === service)?.label} request. Name: ${payload.customer_name}.`); window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer"); }
    } catch { setStatus("Could not submit right now. Please message us on Instagram."); } finally { setSubmitting(false); }
  }
  return <main>
    <header><a className="brand" href="#top">Your Studio<span>✦</span></a><nav><a href="#services">Services</a><a href="#work">My work</a><a href="#order">Order</a></nav><a className="outline" href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a></header>
    <section id="top" className="hero"><p className="eyebrow">CUSTOM CREATIONS · BEAUTY FOR YOUR BIG DAY</p><h1>Made with<br/><i>care for you.</i></h1><p className="lede">Choose handmade Art & Craft for thoughtful moments, or Bridal Makeup for your most memorable one.</p><a className="button" href="#services">Explore services</a></section>
    <section id="services" className="section"><p className="eyebrow">WHAT I OFFER</p><h2>Two services.<br/>One personal touch.</h2><div className="service-grid">{services.map(item => <article className="service-card" key={item.id}><div className={`service-image ${item.id}`} style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}><span>{item.image ? "" : item.id === "art-craft" ? "Custom handmade details" : "Your bridal glow"}</span></div><p className="eyebrow">{item.label}</p><h3>{item.label}</h3><p>{item.description}</p><button className="text-button" onClick={() => chooseService(item.id)}>Request this service →</button></article>)}</div></section>
    <section id="work" className="work-section"><div><p className="eyebrow">PORTFOLIO</p><h2>See more of<br/>my work.</h2><p>Upload your best Art & Craft and Bridal Makeup photos to Supabase, then add their public links in GitHub Secrets. Your two featured images will appear above.</p></div><a className="instagram-card" href={instagramUrl} target="_blank" rel="noreferrer"><span>Follow along</span><strong>@yourinstagram</strong><small>Open Instagram ↗</small></a></section>
    <section id="order" className="order-section"><div><p className="eyebrow">START YOUR REQUEST</p><h2>Tell me what<br/>you have in mind.</h2><p>Submit your details. If WhatsApp is configured, you will also be taken there to send a quick confirmation.</p></div><form className="order-form" onSubmit={submitOrder}><label>Service<select value={service} onChange={event => setService(event.target.value as Service)}><option value="art-craft">Art & Craft</option><option value="bridal-makeup">Bridal Makeup</option></select></label><label>Your name<input name="name" required placeholder="Your name"/></label><label>Phone / WhatsApp<input name="phone" required placeholder="Your phone number"/></label><label>Event or required date<input name="date" type="date"/></label><label>What would you like?<textarea name="details" rows={4} placeholder="Colours, occasion, number of people, budget…"/></label><button className="button" disabled={submitting}>{submitting ? "Sending…" : "Submit request"}</button>{status && <p className="form-status">{status}</p>}</form></section>
    <footer>Art & Craft · Bridal Makeup · <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a></footer><ChatWidget />
  </main>;
}
