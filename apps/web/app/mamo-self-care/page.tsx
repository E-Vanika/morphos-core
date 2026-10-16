"use client";

import { FormEvent, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";

type Item = { name: string; price: string };
type Menu = { title: string; items: Item[] };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const menus: Menu[] = [
  { title: "Facials", items: [["Basic","₹2,500"],["Hydra","₹3,200"],["Skin brightening","₹4,000"],["Advanced tan removal","₹3,600"],["Bridal glow","₹4,800"],["Anti-aging","₹3,500"]].map(([name,price])=>({name,price})) },
  { title: "Clean-up", items: [["Basic","₹850"],["Hydra","₹1,500"],["Clean and clear","₹2,500"]].map(([name,price])=>({name,price})) },
  { title: "Peel-off mask add-ons", items: [["Brightening","₹500"],["Bridal glow","₹800"],["Whitening","₹900"],["Hydra","₹1,000"],["Anti-aging","₹1,200"]].map(([name,price])=>({name,price})) },
  { title: "Body waxing", items: [["Underarms","₹380"],["Half arms","₹550"],["Full arms","₹650"],["Half legs","₹750"],["Full legs","₹950"],["Half back","₹800"],["Full back","₹950"],["Stomach","₹650"]].map(([name,price])=>({name,price})) },
  { title: "Face waxing", items: [["Full face","₹800"],["Sides (both)","₹250"],["Forehead","₹180"],["Upper neck","₹170"],["Upper lip","₹80"],["Chin","₹40"]].map(([name,price])=>({name,price})) },
  { title: "Brazilian waxing", items: [["Underarms","₹450"],["Full bikini — front and back","₹3,500"],["Bikini — front","₹1,600"]].map(([name,price])=>({name,price})) },
  { title: "Pedicure", items: [["Basic","₹900"],["Tan removal","₹1,550"],["Advanced","₹2,000"],["Ice cream","₹2,200"],["Heel smoothing","₹2,500"]].map(([name,price])=>({name,price})) },
  { title: "Manicure", items: [["Basic","₹550"],["Tan removal","₹1,200"],["Advanced","₹1,800"]].map(([name,price])=>({name,price})) },
  { title: "Threading", items: [["Forehead","₹40"],["Eyebrows","₹70"],["Upper lip","₹50"],["Chin","₹30"],["Sides","₹60"]].map(([name,price])=>({name,price})) },
  { title: "Massage therapy — 1 hour / 30 min", items: [["Head massage","₹1,000 / ₹500"],["Face massage","₹800 / ₹400"],["Foot massage","₹600 / ₹300"],["Back massage","₹700 / ₹450"],["Full-body massage (women)","₹2,500 / ₹1,800"]].map(([name,price])=>({name,price})) },
];

const combos = [
  { price: "₹3,800", text: "Underarm, full-arm and full-leg waxing · Basic clean-up · Basic pedicure and manicure" },
  { price: "₹4,200", text: "Underarm, full-arm and half-leg waxing · Basic facial · Threading · Face and neck de-tan" },
  { price: "₹4,500", text: "Pedicure · Threading · Underarm, full-arm and full-leg waxing · 30-minute head massage" },
  { price: "₹5,000", text: "Tan-removal pedicure · Hydra facial · De-tan · Underarm, full-arm and half-leg waxing · Complimentary threading" },
  { price: "₹6,500", text: "Underarm, full-arm and full-leg waxing · Pedicure · Manicure · Skin-brightening facial · De-tan · 15-minute back massage · Complimentary threading" },
];

export default function SelfCarePage() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMenus = menus.map(menu => ({ ...menu, items: menu.items.filter(item => !normalizedQuery || `${menu.title} ${item.name}`.toLowerCase().includes(normalizedQuery)) })).filter(menu => menu.items.length);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setSubmitting(true); setStatus("");
    try {
      const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service: "self-care", customer_name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? ""), event_date: String(form.get("date") ?? "") || null, event_place: String(form.get("place") ?? "") || null, requested_service: String(form.get("service") ?? ""), details: String(form.get("details") ?? "") || null }) });
      const result = await response.json().catch(() => ({})) as { detail?: string };
      if (!response.ok) throw new Error(result.detail ?? "Enquiry failed");
      setStatus("Thank you — your self-care enquiry was sent."); element.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "The enquiry could not be sent just now. Please try again later."); }
    finally { setSubmitting(false); }
  }
  return <main className="bridal-site self-care-page">
    <div className="announcement">Mamo Self Care · Beauty services at home</div>
    <header><a className="brand" href="/"><span className="monogram">MS</span><span>Mamo Self Care<small>At-home beauty menu</small></span></a><nav><a href="/">Glam Up</a><a href="#menu">Menu</a><a href="#combos">Combos</a><a href="/reviews">Reviews</a></nav><div className="header-actions"><ThemeToggle/><a className="outline" href="#enquire">Enquire</a></div></header>
    <section className="self-care-hero"><p className="eyebrow">BEAUTY, BROUGHT HOME</p><h1>Care for yourself,<br/><i>in your own space.</i></h1><p>Facials, grooming, manicure, pedicure and massage services with clear, final pricing.</p><div className="hero-actions"><a className="button" href="#menu">Explore the menu</a><a className="text-button" href="#enquire">Request a visit →</a></div><div className="hero-assurance"><span>Final listed prices</span><span>No doorstep fee</span><span>Private enquiry</span></div></section>
    <section id="menu" className="self-care-menu"><div className="section-heading menu-heading"><div><p className="eyebrow">SERVICE MENU</p><h2>Choose your<br/><i>care ritual.</i></h2></div></div><label className="service-search"><span>Find a service</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try facial, waxing or massage"/></label>{filteredMenus.length ? <div className="menu-grid">{filteredMenus.map(menu => <article className="menu-card" key={menu.title}><h3>{menu.title}</h3>{menu.items.map(item => <div key={`${menu.title}-${item.name}`}><span>{item.name}</span><strong>{item.price}</strong></div>)}</article>)}</div> : <p className="empty-search">No matching service. Try a broader word or view the combos below.</p>}<article className="menu-card add-on-card"><h3>Bleach / De-tan add-ons</h3>{[["Full hands","₹400 / ₹1,000"],["Half hands","₹200 / ₹500"],["Full legs","₹800 / ₹1,300"],["Half legs","₹400 / ₹650"],["Feet","₹250 / ₹550"]].map(([name,price])=><div key={name}><span>{name}</span><strong>{price}</strong></div>)}</article></section>
    <section id="combos" className="combo-section"><p className="eyebrow">VALUE COMBOS</p><h2>More care,<br/><i>beautifully bundled.</i></h2><div className="combo-grid">{combos.map(combo => <article key={combo.price}><strong>{combo.price}</strong><p>{combo.text}</p></article>)}</div><p className="transparent-pricing">No extra travel or doorstep-service charges. Prices shown are final, as stated in the supplied menu.</p></section>
    <section id="enquire" className="order-section"><div className="enquiry-copy"><p className="eyebrow">PRIVATE ENQUIRY</p><h2>Plan your<br/>self-care visit.</h2><p>Share the service, preferred date and location. This is an enquiry; availability will be confirmed personally.</p></div><form className="order-form" onSubmit={submit}><div className="form-row"><label>Your name<input name="name" required minLength={2}/></label><label>Mobile number<input name="phone" required minLength={6}/></label></div><label>Service or combo<input name="service" required placeholder="For example: Hydra facial or ₹5,000 combo"/></label><div className="form-row"><label>Preferred date<input name="date" type="date"/></label><label>Area / location<input name="place"/></label></div><label>Anything else?<textarea name="details" rows={4}/></label><button className="button" disabled={submitting}>{submitting ? "Sending…" : "Send private enquiry"}</button>{status && <p className="form-status" role="status">{status}</p>}</form></section>
    <footer><a href="/">← Monika Glam Up</a><a href="/reviews">Client reviews →</a></footer><div className="mobile-action-bar"><a href="#menu">View prices</a><a className="button" href="#enquire">Enquire now</a></div>
  </main>;
}
