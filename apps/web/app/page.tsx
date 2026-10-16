"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChatWidget } from "./components/chat-widget";
import { ThemeToggle } from "./components/theme-toggle";

type GalleryImage = { src: string; label: string };
type ServiceItem = { id: string; name: string; description?: string; price: string };
type Review = { name: string; rating: number; comment: string; event?: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";
const instagram = isBridal
  ? (process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/monika_glamup/")
  : "https://www.instagram.com/crafts.by.vani";

const bridalServices: ServiceItem[] = [
  { id: "matte", name: "Matte Finish Bridal Look", price: "₹8,000", description: "A polished, shine-controlled finish with graceful definition." },
  { id: "soft-glam", name: "Soft Glam Bridal Look", price: "₹9,000", description: "Refined eyes, soft radiance and an effortlessly elegant finish." },
  { id: "skin-finish", name: "Skin Finish Bridal Look", price: "₹10,000", description: "Fresh, skin-like coverage designed to look beautiful in person and on camera." },
  { id: "glow", name: "Glow Finish Bridal Look", price: "₹12,000", description: "A luminous, dimensional finish for a radiant bridal presence." },
  { id: "bridesmaid", name: "Bridesmaid Package", price: "₹5,000", description: "Makeup, hairstyling or hairdo, and saree draping." },
  { id: "party", name: "Party Makeup Package", price: "₹3,500", description: "Makeup and hairstyling for receptions, engagements and special occasions." },
  { id: "hair", name: "Bridal Hairstyling", price: "₹2,500", description: "Hairdo tailored to your outfit, accessories and event." },
  { id: "draping", name: "Saree Draping", price: "₹1,000", description: "Event-ready draping; pre-pleating is available from ₹600." },
];

const craftServices: ServiceItem[] = [
  { id: "pencil", name: "Pencil Art", price: "₹3,000" },
  { id: "embroidery", name: "Embroidery", price: "₹2,000" },
  { id: "painting", name: "Painting", price: "₹1,000" },
  { id: "custom", name: "Custom Work", price: "On request" },
];

const gallery: GalleryImage[] = isBridal
  ? [
      { src: "/gallery/bridal-bridesmaid-makeup.jpeg", label: "Bridesmaid makeup" },
      { src: "/gallery/bridal-hairstyle.jpeg", label: "Bridal hairstyle" },
      { src: "/gallery/bridal-saree-draping.jpeg", label: "Saree draping" },
      { src: "/gallery/bridal-reception-hairstyle.jpeg", label: "Reception hairstyle" },
    ]
  : [
      { src: "/gallery/pencil-art.jpeg", label: "Pencil art" },
      { src: "/gallery/painting-landscape.jpeg", label: "Landscape painting" },
      { src: "/gallery/pencil-art-cryptography.jpeg", label: "Custom pencil art" },
      { src: "/gallery/painting-portrait.jpeg", label: "Portrait painting" },
    ];

export default function Home() {
  const services = isBridal ? bridalServices : craftServices;
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const averageRating = useMemo(() => reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0, [reviews]);

  useEffect(() => {
    if (!isBridal) return;
    fetch(`${apiUrl}/v1/reviews`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => setReviews((data.reviews ?? []).filter((review: Review) => review.name && review.comment && review.rating >= 1 && review.rating <= 5)))
      .catch(() => setReviews([]));
  }, []);

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const payload = {
      service: isBridal ? "bridal-makeup" : "art-craft",
      customer_name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      event_date: String(form.get("date") ?? "") || null,
      event_time: String(form.get("time") ?? "") || null,
      event_place: String(form.get("place") ?? "") || null,
      client_count: Number(form.get("clients")) || null,
      requested_service: String(form.get("requested_service") ?? "") || null,
      details: String(form.get("details") ?? "") || null,
    };
    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({})) as { detail?: string };
      if (!response.ok) throw new Error(result.detail ?? "The enquiry could not be saved.");
      setStatus("Thank you — your enquiry was sent. Monika will review the details and contact you.");
      element.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The enquiry could not be sent. Please contact us through Instagram.");
    } finally { setSubmitting(false); }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const review = { name: String(form.get("review_name") ?? ""), rating: Number(form.get("rating")), comment: String(form.get("comment") ?? ""), event: String(form.get("event_type") ?? "") };
    setReviewStatus("");
    try {
      const response = await fetch(`${apiUrl}/v1/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(review) });
      const result = await response.json().catch(() => ({})) as { detail?: string };
      if (!response.ok) throw new Error(result.detail ?? "The review could not be saved.");
      setReviews(current => [review, ...current]);
      setReviewStatus("Thank you — your review is now visible.");
      element.reset();
    } catch (error) { setReviewStatus(error instanceof Error ? error.message : "The review could not be sent just now. Please try again later."); }
  }

  if (!isBridal) return <main className="craft-site simple-site"><header><a className="brand" href="#top">Crafts by Vani <span>✦</span></a><nav><a href="#services">Services</a><a href="#work">Work</a><a href="#enquire">Enquire</a></nav><ThemeToggle/></header><section id="top" className="hero"><p className="eyebrow">HANDMADE GIFTS · CUSTOM ART</p><h1>Made with<br/><i>heart.</i></h1><p className="lede">Thoughtful portraits, embroidery, paintings and custom keepsakes.</p><a className="button" href="#enquire">Start an enquiry</a></section><ServiceGrid services={services}/><section id="work" className="section"><Gallery/></section><EnquiryForm services={services} status={status} submitting={submitting} onSubmit={submitEnquiry}/><footer>Crafts by Vani · <a href={instagram}>Instagram</a></footer><ChatWidget/></main>;

  return <main className="bridal-site">
    <div className="announcement">Now accepting bridal, bridesmaid and special-event enquiries</div>
    <header><a className="brand" href="#top"><span className="monogram">MG</span><span>Monika Glam Up<small>Bridal beauty artistry</small></span></a><nav><a href="#services">Services</a><a href="/reviews">Reviews</a><a href="/mamo-self-care">Self-care</a><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></nav><div className="header-actions"><ThemeToggle/><a className="outline" href="#enquire">Check your date</a></div></header>

    <section id="top" className="hero bridal-hero"><div className="hero-copy"><p className="eyebrow">BRIDAL MAKEUP · HAIRSTYLING · SAREE DRAPING</p><h1>Your moment,<br/><i>beautifully you.</i></h1><p className="lede">Personalised bridal artistry that brings your outfit, features and celebration together in one considered look.</p><div className="hero-actions"><a className="button" href="#enquire">Check availability</a><a className="text-button" href="#services">Explore bridal finishes →</a></div><div className="hero-assurance" aria-label="Booking assurances"><span>Transparent pricing</span><span>Private enquiry</span><span>Personal confirmation</span></div><div className="hero-facts"><span><strong>4</strong> bridal finishes</span><span><strong>1</strong> complete look</span><span><strong>Tailored</strong> to your event</span></div></div><div className="hero-visual" aria-label="Monika Glam Up bridal work"><img className="hero-main-image" src="/gallery/bridal-bridesmaid-makeup.jpeg" alt="Bridal makeup by Monika Glam Up"/><div className="hero-detail"><img src="/gallery/bridal-hairstyle.jpeg" alt="Bridal hairstyling detail"/><p><span>THE SIGNATURE</span>Makeup, hair & draping—planned as one.</p></div></div></section>
    <section className="promise-strip"><span>Personalised finish</span><span>Complete bridal styling</span><span>On-location service</span><span>Thoughtful look planning</span></section>

    <section id="services" className="section service-section"><div className="section-heading"><div><p className="eyebrow">THE SERVICE MENU</p><h2>A finish for<br/><i>every bride.</i></h2></div><p>Each bridal look is adapted to your outfit, skin requirements, event and preferred overall appearance.</p></div><div className="price-grid">{services.slice(0,4).map((service,index)=><article className="price-card" key={service.id}><span className="card-number">0{index+1}</span><h3>{service.name}</h3><p>{service.description}</p><div><small>Starting at</small><strong>{service.price}</strong></div></article>)}</div><div className="included-panel"><p className="eyebrow">EVERY BRIDAL PACKAGE INCLUDES</p><ul><li>Selected bridal makeup finish</li><li>Bridal hairstyling or hairdo</li><li>Saree draping</li><li>Hair finishing and styling support</li><li>Hair extensions when required, by prior discussion</li></ul><p className="fine-print">Lenses, eyelashes, travel, special accessories and customised requirements are quoted separately.</p></div></section>

    <section id="experience" className="experience-section"><div className="experience-image"><img src="/gallery/bridal-reception-hairstyle.jpeg" alt="Reception hairstyle by Monika Glam Up"/><span>Elegant from every angle</span></div><div><p className="eyebrow">BEYOND THE BRIDAL LOOK</p><h2>For every person<br/>and every celebration.</h2><div className="mini-menu">{services.slice(4).map(service=><div key={service.id}><span>{service.name}</span><strong>{service.price}</strong><small>{service.description}</small></div>)}</div></div></section>

    <section className="process-section"><p className="eyebrow">YOUR BOOKING JOURNEY</p><div className="process-grid"><div><span>01</span><h3>Share your event</h3><p>Date, time, place, number of clients and the services you need.</p></div><div><span>02</span><h3>Plan the look</h3><p>Send your outfit, jewellery, hairstyle references and preferred finish.</p></div><div><span>03</span><h3>Review & confirm</h3><p>Monika reviews availability, travel and requirements before sharing the final quote.</p></div></div></section>

    <section id="reviews" className="reviews-section"><div className="review-heading"><p className="eyebrow">CLIENT REVIEWS</p><h2>Kind words,<br/><i>shared openly.</i></h2><p>Every client rating and comment is published automatically. Visit the reviews page for the complete rating breakdown.</p>{reviews.length>0&&<div className="rating-summary"><strong>{averageRating.toFixed(1)}</strong><span>{"★".repeat(Math.round(averageRating))}<small>{reviews.length} client reviews</small></span></div>}<a className="text-button" href="/reviews">See all reviews →</a></div><div>{reviews.length>0&&<div className="review-list">{reviews.slice(0,3).map((review,index)=><blockquote key={`${review.name}-${index}`}><span>{"★".repeat(review.rating)}</span><p>“{review.comment}”</p><footer>{review.name}{review.event?` · ${review.event}`:""}</footer></blockquote>)}</div>}<form className="review-form" onSubmit={submitReview}><h3>Share your experience</h3><div className="form-row"><label>Your name<input name="review_name" required/></label><label>Rating<select name="rating" required defaultValue=""><option value="" disabled>Select</option><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Needs improvement</option></select></label></div><label>Service or event<input name="event_type" placeholder="Bridal, engagement, party…"/></label><label>Your comment<textarea name="comment" required minLength={10} rows={4} placeholder="Tell us about your experience"/></label><button className="outline">Publish review</button>{reviewStatus&&<p className="form-status" role="status">{reviewStatus}</p>}</form></div></section>

    <section className="faq-section"><div><p className="eyebrow">BEFORE YOU ENQUIRE</p><h2>Good to know.</h2></div><div className="faq-list"><details><summary>How is my date confirmed?</summary><p>The form is an enquiry only. Your date is confirmed after Monika reviews availability, requirements, travel and the agreed booking terms.</p></details><details><summary>What should I share for look planning?</summary><p>Your outfit, jewellery and accessories, hairstyle references, preferred makeup finish, event time and venue.</p></details><details><summary>Are travel and add-ons included?</summary><p>Travel is based on location. Lenses, eyelashes, special accessories and extra products are separate unless agreed in your final quote.</p></details><details><summary>Can I book several people or events?</summary><p>Yes. Share the number of clients, services and all event dates so a customised quotation and schedule can be prepared.</p></details></div></section>

    <EnquiryForm services={services} status={status} submitting={submitting} onSubmit={submitEnquiry}/>
    <footer><div><span className="monogram">MG</span><span><strong>Monika Glam Up</strong><small>Bridal Makeup · Hairstyling · Saree Draping</small></span></div><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></footer><div className="mobile-action-bar"><a href="#services">View prices</a><a className="button" href="#enquire">Check your date</a></div><ChatWidget/>
  </main>;
}

function ServiceGrid({services}:{services:ServiceItem[]}){return <section id="services" className="section"><p className="eyebrow">SERVICES</p><h2>Made for meaningful moments.</h2><div className="price-grid">{services.map(service=><article className="price-card" key={service.id}><h3>{service.name}</h3><strong>{service.price}</strong></article>)}</div></section>}
function Gallery(){return <div className="gallery">{gallery.map((image,index)=><a href={instagram} target="_blank" rel="noreferrer" key={`${image.src}-${index}`}><img src={image.src} alt={`Monika Glam Up — ${image.label}`}/></a>)}</div>}
function EnquiryForm({services,status,submitting,onSubmit}:{services:ServiceItem[];status:string;submitting:boolean;onSubmit:(event:FormEvent<HTMLFormElement>)=>void}){return <section id="enquire" className="order-section"><div className="enquiry-copy"><p className="eyebrow">PRIVATE ENQUIRY</p><h2>Let&apos;s plan<br/>your look.</h2><p>Tell us about your event. This sends a private enquiry—it does not confirm the booking. Monika will review your date, location and requirements before responding.</p><div className="ai-note"><span>✦</span><p><strong>Not sure what to choose?</strong><br/>Ask the AI bridal concierge to compare finishes or explain what is included.</p></div></div><form className="order-form" onSubmit={onSubmit}><div className="form-row"><label>Your name<input name="name" required autoComplete="name" placeholder="Full name"/></label><label>Mobile number<input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Best number to reach you"/></label></div><label>Service<select name="requested_service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service=><option key={service.id} value={service.name}>{service.name} — {service.price}</option>)}</select></label><div className="form-row three"><label>Event date<input name="date" type="date"/></label><label>Event time<input name="time" type="time"/></label><label>No. of clients<input name="clients" type="number" min="1" max="50" placeholder="1"/></label></div><label>Event place<input name="place" placeholder="Venue or area"/></label><label>Anything else we should know?<textarea name="details" rows={4} placeholder="Outfit, preferred finish, hairstyle, travel or multiple-event details…"/></label><button className="button" disabled={submitting}>{submitting?"Sending enquiry…":"Send private enquiry"}</button><p className="privacy-note">Your details are used only to respond to this enquiry.</p>{status&&<p className="form-status" role="status">{status}</p>}</form></section>}
