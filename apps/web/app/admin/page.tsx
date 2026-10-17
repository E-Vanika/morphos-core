"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { SiteImage, SiteService } from "../../lib/site-content";

type AdminReview = { id?: string; name: string; rating: number; event?: string; comment: string };

async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.detail ?? "The request failed.");
  return result;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [services, setServices] = useState<SiteService[]>([]);
  const [images, setImages] = useState<SiteImage[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [content, reviewData] = await Promise.all([api("/api/admin/content"), api("/api/admin/reviews")]);
    setServices(content.services ?? []);
    setImages(content.images ?? []);
    setReviews(reviewData.reviews ?? []);
  }, []);

  useEffect(() => {
    api("/api/admin/session").then(async result => {
      setAuthenticated(Boolean(result.authenticated));
      if (result.authenticated) await load();
    }).catch(() => setAuthenticated(false));
  }, [load]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    try { await api("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); setAuthenticated(true); await load(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Login failed."); }
    finally { setBusy(false); }
  }

  async function logout() { await api("/api/admin/login", { method: "DELETE" }); setAuthenticated(false); }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = new FormData(event.currentTarget);
    const service = { type: "service", id: form.get("id"), name: form.get("name"), price: form.get("price"), description: form.get("description") };
    try { await api("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(service) }); setStatus("Service saved. The public site will use it immediately."); await load(); event.currentTarget.reset(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Service could not be saved."); }
    finally { setBusy(false); }
  }

  async function deleteReview(id?: string) {
    if (!id || !confirm("Delete this review permanently?")) return;
    setBusy(true); setStatus("");
    try { await api("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setReviews(current => current.filter(review => review.id !== id)); setStatus("Review deleted."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Review could not be deleted."); }
    finally { setBusy(false); }
  }

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    try { const result = await api("/api/admin/images", { method: "POST", body: new FormData(event.currentTarget) }); setImages(current => current.map(image => image.id === result.image.id ? result.image : image)); setStatus("Image uploaded and published."); event.currentTarget.reset(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Image could not be uploaded."); }
    finally { setBusy(false); }
  }

  if (authenticated === null) return <main className="admin-shell"><p>Checking administrator session…</p></main>;
  if (!authenticated) return <main className="admin-shell admin-login"><form onSubmit={login}><img src="/monika-glamup-icon.svg" alt=""/><p className="eyebrow">MONIKA GLAM UP</p><h1>Administrator</h1><p>Sign in to manage public services, images and client reviews.</p><label>Password<input name="password" type="password" required autoComplete="current-password"/></label><button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{status && <p className="form-status">{status}</p>}</form></main>;

  return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">PRIVATE ADMIN</p><h1>Content studio</h1></div><div><a className="outline" href="/" target="_blank">View website</a><button className="outline" onClick={logout}>Sign out</button></div></header>{status && <p className="admin-status" role="status">{status}</p>}
    <section className="admin-section"><div className="admin-section-title"><div><p className="eyebrow">SERVICES & PRICES</p><h2>Edit published services</h2></div><p>Saving an existing ID updates it. A new ID adds another service.</p></div><div className="admin-service-grid">{services.map(service => <form key={service.id} onSubmit={saveService} className="admin-card"><input type="hidden" name="id" value={service.id}/><label>Service name<input name="name" defaultValue={service.name} required/></label><label>Displayed price<input name="price" defaultValue={service.price} required/></label><label>Description<textarea name="description" defaultValue={service.description} rows={3} required/></label><button className="button" disabled={busy}>Save changes</button></form>)}</div><form className="admin-card admin-add" onSubmit={saveService}><h3>Add another service</h3><div className="form-row"><label>Unique ID<input name="id" placeholder="engagement-makeup" pattern="[a-z0-9-]+" required/></label><label>Service name<input name="name" required/></label></div><label>Displayed price<input name="price" placeholder="₹4,500 or On request" required/></label><label>Description<textarea name="description" rows={3} required/></label><button className="button" disabled={busy}>Add service</button></form></section>
    <section className="admin-section"><div className="admin-section-title"><div><p className="eyebrow">FEATURED IMAGES</p><h2>Replace the three main photos</h2></div><p>JPG, PNG or WebP, maximum 5 MB. Uploads use the public Supabase bridal bucket.</p></div><div className="admin-image-grid">{images.map(image => <form key={image.id} onSubmit={uploadImage} className="admin-card"><img src={image.url} alt={image.alt}/><strong>{image.id === "hero-main" ? "Large hero photo" : image.id === "hero-detail" ? "Small overlay photo" : "Experience photo"}</strong><input type="hidden" name="slot" value={image.id}/><label>Image description<input name="alt" defaultValue={image.alt} required/></label><label>Choose replacement<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required/></label><button className="button" disabled={busy}>Upload replacement</button></form>)}</div></section>
    <section className="admin-section"><div className="admin-section-title"><div><p className="eyebrow">CLIENT REVIEWS</p><h2>Review management</h2></div><p>Deletion is permanent and immediately removes the review from the public site.</p></div><div className="admin-review-list">{reviews.length ? reviews.map(review => <article className="admin-card" key={review.id}><span className="stars">{"★".repeat(review.rating)}</span><p>“{review.comment}”</p><small>{review.name}{review.event ? ` · ${review.event}` : ""}</small><button className="admin-danger" disabled={busy || !review.id} onClick={() => deleteReview(review.id)}>Delete review</button></article>) : <p>No reviews found.</p>}</div></section>
  </main>;
}
