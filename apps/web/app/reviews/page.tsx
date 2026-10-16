"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "../components/theme-toggle";

type Review = { name: string; rating: number; comment: string; event?: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews]);
  const counts = useMemo(() => [5, 4, 3, 2, 1].map(rating => ({ rating, count: reviews.filter(review => review.rating === rating).length })), [reviews]);

  useEffect(() => {
    fetch(`${apiUrl}/v1/reviews`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => setReviews((data.reviews ?? []).filter((review: Review) => review.name && review.comment && review.rating >= 1 && review.rating <= 5)))
      .catch(() => setStatus("Reviews could not be loaded just now."))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const review = { name: String(form.get("name") ?? ""), rating: Number(form.get("rating")), event: String(form.get("event") ?? ""), comment: String(form.get("comment") ?? "") };
    setStatus("");
    try {
      const response = await fetch(`${apiUrl}/v1/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(review) });
      const result = await response.json().catch(() => ({})) as { detail?: string };
      if (!response.ok) throw new Error(result.detail ?? "Review save failed");
      setReviews(current => [review, ...current]);
      setStatus("Thank you — your review is now visible.");
      formElement.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The review could not be sent just now. Please try again later.");
    }
  }

  return <main className="bridal-site reviews-page">
    <div className="announcement">Monika Glam Up · Client experiences</div>
    <header><a className="brand" href="/"><span className="monogram">MG</span><span>Monika Glam Up<small>Bridal beauty artistry</small></span></a><nav><a href="/">Home</a><a href="/#services">Services</a><a href="/mamo-self-care">Self-care</a><a href="https://www.instagram.com/monika_glamup/" target="_blank" rel="noreferrer">Instagram ↗</a></nav><div className="header-actions"><ThemeToggle/><a className="outline" href="/#enquire">Check your date</a></div></header>
    <section className="review-page-hero"><div><p className="eyebrow">CLIENT REVIEWS</p><h1>Every rating.<br/><i>Every story.</i></h1><p>All submitted ratings and comments appear here automatically, with no approval queue.</p></div><div className="review-overview"><strong>{reviews.length ? average.toFixed(1) : "—"}</strong><span className="stars">{"★".repeat(Math.round(average))}{"☆".repeat(5 - Math.round(average))}</span><small>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</small>{counts.map(item => <div className="rating-row" key={item.rating}><span>{item.rating}</span><span className="rating-track"><i style={{width: `${reviews.length ? item.count / reviews.length * 100 : 0}%`}}/></span><small>{item.count}</small></div>)}</div></section>
    <section className="all-reviews"><div><p className="eyebrow">WHAT CLIENTS SAY</p>{loading ? <p>Loading reviews…</p> : reviews.length ? <div className="review-list">{reviews.map((review, index) => <blockquote key={`${review.name}-${index}`}><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><p>“{review.comment}”</p><footer>{review.name}{review.event ? ` · ${review.event}` : ""}</footer></blockquote>)}</div> : <p>No reviews yet. Be the first to share your experience.</p>}</div><form id="write-review" className="review-form" onSubmit={submit}><h2>Write a review</h2><p>Your review will be published immediately.</p><label>Your name<input name="name" required minLength={2}/></label><label>Rating<select name="rating" defaultValue="" required><option value="" disabled>Select a rating</option><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Needs improvement</option></select></label><label>Service or event<input name="event" placeholder="Bridal, engagement, party…"/></label><label>Your comment<textarea name="comment" required minLength={10} rows={5}/></label><button className="button">Publish review</button>{status && <p className="form-status" role="status">{status}</p>}</form></section>
    <footer><a href="/">← Monika Glam Up</a><a href="/#enquire">Private enquiry →</a></footer><div className="mobile-action-bar"><a href="/">Home</a><a className="button" href="#write-review">Write a review</a></div>
  </main>;
}
