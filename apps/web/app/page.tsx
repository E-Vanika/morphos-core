"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChatWidget } from "./components/chat-widget";
import { ThemeToggle } from "./components/theme-toggle";
import { DEFAULT_MONIKA_IMAGES, DEFAULT_MONIKA_SERVICES, type SiteImage } from "../lib/site-content";

type GalleryImage = { src: string; label: string };
type ServiceItem = { id: string; name: string; description?: string; price: string };
type Review = { name: string; rating: number; comment: string; event?: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
// Monika is the safe default for direct Vercel/Git deployments. The Crafts
// project must opt in explicitly with NEXT_PUBLIC_SITE_KIND=craft.
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND !== "craft";
const instagram = isBridal
  ? (process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/monika_glamup/")
  : "https://www.instagram.com/crafts.by.vani";
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/message/FMLPL4OHORWNC1";

const craftServices: ServiceItem[] = [
  { id: "pencil", name: "Pencil Art", price: "₹3,000", description: "Detailed, hand-drawn portraits created from your chosen photograph." },
  { id: "embroidery", name: "Embroidery", price: "₹2,000", description: "Personalised thread work for meaningful gifts and keepsakes." },
  { id: "painting", name: "Painting", price: "₹1,000", description: "Original painted pieces shaped around your idea, subject and occasion." },
  { id: "custom", name: "Custom Work", price: "On request", description: "A made-to-order creative piece planned around your reference and budget." },
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
  const [services, setServices] = useState<ServiceItem[]>(isBridal ? DEFAULT_MONIKA_SERVICES : craftServices);
  const [siteImages, setSiteImages] = useState<SiteImage[]>(DEFAULT_MONIKA_IMAGES);
  const [status, setStatus] = useState("");
  const [showStatusWhatsApp, setShowStatusWhatsApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const averageRating = useMemo(() => reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0, [reviews]);

  useEffect(() => {
    if (!isBridal) return;
    fetch(`${apiUrl}/v1/site-content`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => { if (Array.isArray(data.services)) setServices(data.services); if (Array.isArray(data.images)) setSiteImages(data.images); })
      .catch(() => undefined);
    fetch(`${apiUrl}/v1/reviews`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => setReviews((data.reviews ?? []).filter((review: Review) => review.name && review.comment && review.rating >= 1 && review.rating <= 5)))
      .catch(() => setReviews([]));
  }, []);

  const heroMain = siteImages.find(image => image.id === "hero-main") ?? DEFAULT_MONIKA_IMAGES[0];
  const heroDetail = siteImages.find(image => image.id === "hero-detail") ?? DEFAULT_MONIKA_IMAGES[1];
  const experienceImage = siteImages.find(image => image.id === "experience") ?? DEFAULT_MONIKA_IMAGES[2];

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
    setShowStatusWhatsApp(false);
    try {
      const response = await fetch(`${apiUrl}/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({})) as { detail?: string; message?: string; contact_url?: string };
      if (!response.ok) throw new Error(response.status === 400
        ? (result.detail ?? "Please complete every required field.")
        : "Sorry for the inconvenience. The enquiry could not be sent just now. Please contact Monika on WhatsApp.");
      setStatus(result.message ?? (isBridal ? "Thank you — your enquiry was sent. Monika will review the details and contact you." : "Thank you — your creative enquiry was sent. Vani will review the details and contact you."));
      setShowStatusWhatsApp(isBridal && Boolean(result.contact_url));
      element.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sorry for the inconvenience. The enquiry could not be sent just now.");
      setShowStatusWhatsApp(isBridal);
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

  if (!isBridal) return <main className="craft-site"><div className="announcement">Handmade portraits, paintings and personalised keepsakes</div><header><a className="brand" href="#top"><span className="monogram">CV</span><span>Crafts by Vani<small>Custom art & handmade gifts</small></span></a><nav><a href="#services">Services</a><a href="#work">Selected work</a><a href="#process">Process</a><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></nav><div className="header-actions"><ThemeToggle/><a className="outline" href="#enquire">Start an enquiry</a></div></header><section id="top" className="hero craft-hero"><div><p className="eyebrow">HANDMADE GIFTS · CUSTOM ART</p><h1>Made by hand.<br/><i>Kept for years.</i></h1><p className="lede">Thoughtful portraits, embroidery, paintings and one-of-a-kind keepsakes created around your story.</p><div className="hero-actions"><a className="button" href="#enquire">Discuss your idea</a><a className="text-button" href="#work">See selected work →</a></div><div className="hero-assurance"><span>Made to order</span><span>Personal planning</span><span>Private enquiry</span></div></div><div className="craft-hero-art"><img src="/gallery/pencil-art.jpeg" alt="Hand-drawn pencil portrait by Crafts by Vani"/><div><img src="/gallery/painting-portrait.jpeg" alt="Custom portrait painting by Crafts by Vani"/><span>Created from your reference</span></div></div></section><section className="promise-strip"><span>Portrait commissions</span><span>Personalised details</span><span>Handmade finish</span><span>Clear quotation</span></section><section id="services" className="section craft-services"><div className="section-heading"><div><p className="eyebrow">WHAT VANI CREATES</p><h2>A personal idea,<br/><i>made tangible.</i></h2></div><p>Choose a starting point, then share the subject, size, occasion and deadline for a tailored quotation.</p></div><div className="price-grid">{services.map((service,index)=><article className="price-card" key={service.id}><span className="card-number">0{index+1}</span><h3>{service.name}</h3><p>{service.description}</p><div><small>{service.price === "On request" ? "Custom quote" : "Starting at"}</small><strong>{service.price}</strong></div></article>)}</div></section><section id="work" className="craft-work"><div><p className="eyebrow">SELECTED WORK</p><h2>Details that feel<br/><i>entirely yours.</i></h2><p>Portraits and paintings created as personal gifts, memories and decorative pieces.</p><a className="text-button" href={instagram} target="_blank" rel="noreferrer">Explore more on Instagram →</a></div><Gallery/></section><section id="process" className="process-section"><p className="eyebrow">FROM IDEA TO ARTWORK</p><div className="process-grid"><div><span>01</span><h3>Share the idea</h3><p>Tell Vani the artwork type, occasion, preferred size, reference image and deadline.</p></div><div><span>02</span><h3>Review the plan</h3><p>The details, feasibility, timeline and quotation are reviewed before work begins.</p></div><div><span>03</span><h3>Create with care</h3><p>Your piece is made by hand with attention to the personal details that matter.</p></div></div></section><CraftEnquiry services={services} status={status} submitting={submitting} onSubmit={submitEnquiry}/><footer><div><span className="monogram">CV</span><span><strong>Crafts by Vani</strong><small>Custom art · Handmade gifts</small></span></div><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></footer><div className="mobile-action-bar"><a href="#services">View prices</a><a className="button" href="#enquire">Discuss your idea</a></div><ChatWidget/></main>;

  return <main className="bridal-site">
    <div className="announcement">Now accepting bridal, bridesmaid and special-event enquiries</div>
    <header><a className="brand" href="#top"><img className="brand-logo-mark" src="/monika-glamup-icon.svg" alt=""/><span>Monika Glam Up<small>Bridal beauty artistry</small></span></a><nav><a href="#services">Services</a><a href="/reviews">Reviews</a><a href="/mamo-self-care">Self-care</a><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a></nav><div className="header-actions"><ThemeToggle/><a className="outline" href="#enquire">Check your date</a></div></header>

    <section id="top" className="hero bridal-hero"><div className="hero-copy"><p className="eyebrow">BRIDAL MAKEUP · HAIRSTYLING · SAREE DRAPING</p><h1>Your moment,<br/><i>beautifully you.</i></h1><p className="lede">Personalised bridal artistry that brings your outfit, features and celebration together in one considered look.</p><div className="hero-actions"><a className="button" href="#enquire">Check availability</a><a className="text-button" href="#services">Explore bridal finishes →</a><a className="whatsapp-link" href={whatsapp} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a></div><div className="hero-assurance" aria-label="Booking assurances"><span>Transparent pricing</span><span>Private enquiry</span><span>Personal confirmation</span></div><div className="hero-facts"><span><strong>4</strong> bridal finishes</span><span><strong>1</strong> complete look</span><span><strong>Tailored</strong> to your event</span></div></div><div className="hero-visual" aria-label="Monika Glam Up bridal work"><img className="hero-main-image" src={heroMain.url} alt={heroMain.alt}/><div className="hero-detail"><img src={heroDetail.url} alt={heroDetail.alt}/><p><span>THE SIGNATURE</span>Makeup, hair & draping—planned as one.</p></div></div></section>
    <section className="promise-strip"><span>Personalised finish</span><span>Complete bridal styling</span><span>On-location service</span><span>Thoughtful look planning</span></section>

    <section id="services" className="section service-section"><div className="section-heading"><div><p className="eyebrow">THE SERVICE MENU</p><h2>A finish for<br/><i>every bride.</i></h2></div><p>Each bridal look is adapted to your outfit, skin requirements, event and preferred overall appearance.</p></div><div className="price-grid">{services.slice(0,4).map((service,index)=><article className="price-card" key={service.id}><span className="card-number">0{index+1}</span><h3>{service.name}</h3><p>{service.description}</p><div><small>Starting at</small><strong>{service.price}</strong></div></article>)}</div><div className="included-panel"><div className="included-heading"><div><p className="eyebrow">YOUR COMPLETE BRIDAL LOOK</p><h3>Three essentials,<br/><i>planned as one.</i></h3></div><p>Your makeup, hairstyle and draping are considered together for a balanced, celebration-ready finish.</p></div><div className="included-grid"><article><span>01</span><div><strong>Makeup finish</strong><p>Your selected finish, tailored to your features, outfit and event.</p></div></article><article><span>02</span><div><strong>Bridal hair</strong><p>A coordinated hairstyle or hairdo, finished securely for the occasion.</p></div></article><article><span>03</span><div><strong>Saree draping</strong><p>Neat, event-ready draping planned around your saree and silhouette.</p></div></article></div><div className="included-support"><span>Hair finishing included</span><span>Extensions discussed in advance when required</span></div><p className="fine-print">Lenses, eyelashes, travel, special accessories and customised requirements are quoted separately.</p></div></section>

    <section id="experience" className="experience-section"><div className="experience-image"><img src={experienceImage.url} alt={experienceImage.alt}/><span>Elegant from every angle</span></div><div><p className="eyebrow">BEYOND THE BRIDAL LOOK</p><h2>For every person<br/>and every celebration.</h2><div className="mini-menu">{services.slice(4).map(service=><div key={service.id}><span>{service.name}</span><strong>{service.price}</strong><small>{service.description}</small></div>)}</div></div></section>

    <section className="process-section"><p className="eyebrow">YOUR BOOKING JOURNEY</p><div className="process-grid"><div><span>01</span><h3>Share your event</h3><p>Date, time, place, number of clients and the services you need.</p></div><div><span>02</span><h3>Plan the look</h3><p>Send your outfit, jewellery, hairstyle references and preferred finish.</p></div><div><span>03</span><h3>Review & confirm</h3><p>Monika reviews availability, travel and requirements before sharing the final quote.</p></div></div></section>

    <section id="reviews" className="reviews-section"><div className="review-heading"><p className="eyebrow">CLIENT REVIEWS</p><h2>Kind words,<br/><i>shared openly.</i></h2><p>Every client rating and comment is published automatically. Visit the reviews page for the complete rating breakdown.</p>{reviews.length>0&&<div className="rating-summary"><strong>{averageRating.toFixed(1)}</strong><span>{"★".repeat(Math.round(averageRating))}<small>{reviews.length} client reviews</small></span></div>}<a className="text-button" href="/reviews">See all reviews →</a></div><div>{reviews.length>0&&<div className="review-list">{reviews.slice(0,3).map((review,index)=><blockquote key={`${review.name}-${index}`}><span>{"★".repeat(review.rating)}</span><p>“{review.comment}”</p><footer>{review.name}{review.event?` · ${review.event}`:""}</footer></blockquote>)}</div>}<form className="review-form" onSubmit={submitReview}><h3>Share your experience</h3><div className="form-row"><label>Your name<input name="review_name" required/></label><label>Rating<select name="rating" required defaultValue=""><option value="" disabled>Select</option><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Needs improvement</option></select></label></div><label>Service or event<input name="event_type" placeholder="Bridal, engagement, party…"/></label><label>Your comment<textarea name="comment" required minLength={10} rows={4} placeholder="Tell us about your experience"/></label><button className="outline">Publish review</button>{reviewStatus&&<p className="form-status" role="status">{reviewStatus}</p>}</form></div></section>

    <section className="faq-section"><div><p className="eyebrow">BEFORE YOU ENQUIRE</p><h2>Good to know.</h2></div><div className="faq-list"><details><summary>How is my date confirmed?</summary><p>The form is an enquiry only. Your date is confirmed after Monika reviews availability, requirements, travel and the agreed booking terms.</p></details><details><summary>What should I share for look planning?</summary><p>Your outfit, jewellery and accessories, hairstyle references, preferred makeup finish, event time and venue.</p></details><details><summary>Are travel and add-ons included?</summary><p>Travel is based on location. Lenses, eyelashes, special accessories and extra products are separate unless agreed in your final quote.</p></details><details><summary>Can I book several people or events?</summary><p>Yes. Share the number of clients, services and all event dates so a customised quotation and schedule can be prepared.</p></details></div></section>

    <EnquiryForm services={services} status={status} showWhatsApp={showStatusWhatsApp} submitting={submitting} onSubmit={submitEnquiry}/>
    <footer><div><img className="brand-logo-mark" src="/monika-glamup-icon.svg" alt=""/><span><strong>Monika Glam Up</strong><small>Bridal Makeup · Hairstyling · Saree Draping</small></span></div><div className="footer-links"><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a></div></footer><div className="mobile-action-bar"><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a><a className="button" href="#enquire">Check your date</a></div><ChatWidget/>
  </main>;
}

function ServiceGrid({services}:{services:ServiceItem[]}){return <section id="services" className="section"><p className="eyebrow">SERVICES</p><h2>Made for meaningful moments.</h2><div className="price-grid">{services.map(service=><article className="price-card" key={service.id}><h3>{service.name}</h3><strong>{service.price}</strong></article>)}</div></section>}
function Gallery(){return <div className={`gallery ${isBridal ? "" : "craft-gallery"}`}>{gallery.map((image,index)=><a href={instagram} target="_blank" rel="noreferrer" key={`${image.src}-${index}`}><img src={image.src} alt={`${isBridal ? "Monika Glam Up" : "Crafts by Vani"} — ${image.label}`}/></a>)}</div>}
function CraftEnquiry({services,status,submitting,onSubmit}:{services:ServiceItem[];status:string;submitting:boolean;onSubmit:(event:FormEvent<HTMLFormElement>)=>void}){
  return <section id="enquire" className="order-section craft-enquiry">
    <div className="enquiry-copy">
      <p className="eyebrow">PRIVATE ENQUIRY</p>
      <h2>Tell us what<br/>you imagine.</h2>
      <p>Share the occasion, artwork type, deadline and any reference you have. This starts a conversation—it does not place an order or confirm a delivery date.</p>
      <div className="craft-enquiry-points" aria-label="What happens next">
        <span>Share your reference</span><span>Receive a tailored quote</span><span>Confirm before work begins</span>
      </div>
      <div className="ai-note"><span>✦</span><p><strong>Need help choosing?</strong><br/>Ask the creative concierge what details make a useful commission brief.</p></div>
    </div>
    <form className="order-form" onSubmit={onSubmit}>
      <p className="required-note"><span>*</span> Name, mobile number, artwork type and your idea are required.</p>
      <div className="form-row"><label>Your name *<input name="name" required autoComplete="name" placeholder="Full name"/></label><label>Mobile number *<input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Best number to reach you"/></label></div>
      <label>Artwork type *<select name="requested_service" required defaultValue=""><option value="" disabled>Select a starting point</option>{services.map(service=><option key={service.id} value={service.name}>{service.name} — {service.price}</option>)}</select></label>
      <div className="form-row"><label>Preferred completion date<input name="date" type="date"/></label><label>Delivery area<input name="place" placeholder="City or area"/></label></div>
      <label>Describe your idea *<textarea name="details" required minLength={10} rows={5} placeholder="Occasion, size, subject, reference image and other personal details…"/></label>
      <button className="button" disabled={submitting}>{submitting?"Sending enquiry…":"Send creative enquiry"}</button>
      {/* Future payment option — add your secure GPay payment link, then uncomment this block.
      <aside className="payment-option">
        <span>OPTIONAL BOOKING PAYMENT</span>
        <strong>Pay your confirmed booking amount</strong>
        <small>Only pay after Vani confirms your quotation and order details.</small>
        <a className="button" href="https://gpay.app.goo.gl/REPLACE_WITH_YOUR_LINK" target="_blank" rel="noreferrer">Pay with GPay ↗</a>
      </aside>
      */}
      <p className="privacy-note">Your details are used only to respond to this enquiry.</p>{status&&<p className="form-status" role="status">{status}</p>}
    </form>
  </section>;
}
function EnquiryForm({services,status,showWhatsApp,submitting,onSubmit}:{services:ServiceItem[];status:string;showWhatsApp:boolean;submitting:boolean;onSubmit:(event:FormEvent<HTMLFormElement>)=>void}){return <section id="enquire" className="order-section"><div className="enquiry-copy"><p className="eyebrow">PRIVATE ENQUIRY</p><h2>Let&apos;s plan<br/>your look.</h2><p>Tell us about your event. This sends a private enquiry—it does not confirm the booking. Monika will review your date, location and requirements before responding.</p><a className="enquiry-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Prefer to chat directly?</strong><small>Message Monika with your event details ↗</small></a><div className="ai-note"><span>✦</span><p><strong>Not sure what to choose?</strong><br/>Ask the AI bridal concierge to compare finishes or explain what is included.</p></div></div><form className="order-form" onSubmit={onSubmit}><p className="required-note"><span>*</span> All fields are required so availability can be checked accurately.</p><div className="form-row"><label>Your name *<input name="name" required autoComplete="name" placeholder="Full name"/></label><label>Mobile number *<input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Best number to reach you"/></label></div><label>Service *<select name="requested_service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service=><option key={service.id} value={service.name}>{service.name} — {service.price}</option>)}</select></label><div className="form-row three"><label>Event date *<input name="date" type="date" required/></label><label>Event time *<input name="time" type="time" required/></label><label>No. of clients *<input name="clients" type="number" min="1" max="50" defaultValue="1" required/></label></div><label>Event place *<input name="place" required placeholder="Venue or area"/></label><label>Look and event details *<textarea name="details" required minLength={10} rows={4} placeholder="Outfit, preferred finish, hairstyle, travel or multiple-event details…"/></label><button className="button" disabled={submitting}>{submitting?"Sending enquiry…":"Send private enquiry"}</button><p className="privacy-note">Your details are used only to respond to this enquiry.</p>{status&&<div className="form-status" role="status"><p>{status}</p>{showWhatsApp&&<a href={whatsapp} target="_blank" rel="noreferrer">Continue on WhatsApp ↗</a>}</div>}</form></section>}
