"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChatWidget } from "./components/chat-widget";

type Provider = { id: string; name: string; specialty: string; price: string; availability: string };

const providers: Provider[] = [
  { id: "maya-chen", name: "Maya Chen", specialty: "Leadership coaching", price: "$95 / 45 min", availability: "Tomorrow, 10:00" },
  { id: "samir-patel", name: "Samir Patel", specialty: "Career strategy", price: "$75 / 45 min", availability: "Thu, 14:30" },
  { id: "elena-rossi", name: "Elena Rossi", specialty: "Design consulting", price: "$110 / 60 min", availability: "Fri, 09:00" },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [selected, setSelected] = useState<Provider | null>(null);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("Ask the concierge about services, availability, or how booking works.");
  const [busy, setBusy] = useState(false);
  const name = process.env.NEXT_PUBLIC_SITE_NAME ?? "Clarity Collective";
  const selectedLabel = useMemo(() => selected ? `${selected.name} — ${selected.specialty}` : "No provider selected", [selected]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`${apiUrl}/v1/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, domain: process.env.NEXT_PUBLIC_DOMAIN_PRESET ?? "professional-services" }),
      });
      const data = await response.json();
      setAnswer(data.answer ?? "The concierge is temporarily unavailable.");
    } catch {
      setAnswer("The API is offline locally. Start the FastAPI service to use the AI concierge.");
    } finally { setBusy(false); }
  }

  return <main>
    <header><a className="brand" href="#top">{name}<span>●</span></a><nav><a href="#experts">Experts</a><a href="#how">How it works</a><a href="#ai">AI concierge</a></nav><button className="outline">Sign in</button></header>
    <section id="top" className="hero"><p className="eyebrow">CONFIGURABLE PROFESSIONAL SERVICES</p><h1>Find the right<br/><i>next step.</i></h1><p className="lede">Book a focused session with an independent expert, supported by an AI concierge that understands the service catalogue.</p><a className="button" href="#experts">Browse experts</a></section>
    <section id="experts" className="section"><div className="section-heading"><p className="eyebrow">CURATED EXPERTS</p><h2>Made for the work ahead.</h2></div><div className="cards">{providers.map((provider) => <article className="card" key={provider.id}><div className="avatar">{provider.name.split(" ").map(part => part[0]).join("")}</div><p className="specialty">{provider.specialty}</p><h3>{provider.name}</h3><p className="availability">Next: {provider.availability}</p><div className="card-footer"><strong>{provider.price}</strong><button onClick={() => setSelected(provider)}>Book session →</button></div></article>)}</div></section>
    <section id="ai" className="ai-panel"><div><p className="eyebrow">AI CONCIERGE · RAG + SKILLS</p><h2>A useful answer,<br/>not a generic chatbot.</h2><p>It retrieves approved admin knowledge and can use domain skills to find an expert, check availability, and prepare a booking.</p></div><div className="chat"><p className="answer">{answer}</p><form onSubmit={ask}><input aria-label="Ask the concierge" value={message} onChange={event => setMessage(event.target.value)} placeholder="Which coach can help me lead a new team?"/><button disabled={busy}>{busy ? "Thinking…" : "Ask"}</button></form></div></section>
    <section id="how" className="booking"><div><p className="eyebrow">DEMO BOOKING</p><h2>{selected ? "Ready when you are." : "Choose an expert to begin."}</h2><p>{selectedLabel}</p></div><button className="button" disabled={!selected} onClick={() => selected && alert(`Demo payment approved. Your booking with ${selected.name} is ready to confirm.`)}>Simulate payment</button></section>
    <footer>Built with Next.js, FastAPI, Supabase, Gemini, Docker and GitHub Actions.</footer><ChatWidget />
  </main>;
}
