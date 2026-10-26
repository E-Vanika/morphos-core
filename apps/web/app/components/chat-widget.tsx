"use client";

import { FormEvent, useRef, useState } from "react";
import { MONIKA_PRICES } from "../../lib/site-content";

type Message = { role: "assistant" | "user"; text: string; sources?: string[] };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND !== "craft";
const contactUrl = isBridal ? (process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/message/FMLPL4OHORWNC1") : "https://www.instagram.com/crafts.by.vani";
const prompts = isBridal ? ["Compare bridal finishes", "What is included?", "What should I share?"] : ["What can I customise?", "How does pricing work?"];

function serviceGuideAnswer(question: string) {
  const query = question.toLowerCase();
  if (!isBridal) return "Please describe the item, size, occasion, deadline and budget in the enquiry form so the artist can prepare a quote.";
  if (query.includes("finish") || query.includes("compare")) return `Bridal looks start at ${MONIKA_PRICES.matte} for matte, ${MONIKA_PRICES.softGlam} for soft glam, ${MONIKA_PRICES.skinFinish} for skin finish and ${MONIKA_PRICES.glow} for glow finish. Monika will recommend the finish after discussing your skin, outfit and event.`;
  if (query.includes("include")) return "Each bridal look includes the selected makeup finish, bridal hairstyling or hairdo, and saree draping. Travel and special accessories are quoted separately.";
  if (query.includes("share") || query.includes("book") || query.includes("available")) return "Please share your event date, time, place, number of clients and preferred service through the private enquiry form. Availability is confirmed personally by Monika.";
  if (query.includes("bridesmaid")) return `The bridesmaid makeup package is ${MONIKA_PRICES.bridesmaid}, and bridesmaid hairstyling is ${MONIKA_PRICES.bridesmaidHair}.`;
  if (query.includes("party")) return `The party makeup package is ${MONIKA_PRICES.party}.`;
  if (query.includes("price") || query.includes("cost")) return `Bridal looks start at ${MONIKA_PRICES.matte}. Bridesmaid makeup is ${MONIKA_PRICES.bridesmaid} and party makeup is ${MONIKA_PRICES.party}. The Services section has the complete menu.`;
  return "I can help with the published service menu. For a personal recommendation, send your date, place, preferred look and number of clients through the enquiry form.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: isBridal ? "Hello, I’m the Monika Glam Up bridal concierge. I can explain services, finishes and what to prepare for your enquiry." : "Hello! I can help with custom art and craft enquiries." }]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setMessages(current => [...current, { role: "user", text: question }]);
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, domain: isBridal ? "bridal-makeup" : "art-craft" }) });
      if (!response.ok) throw new Error("Chat unavailable");
      const data: { answer?: string; sources?: string[] } = await response.json();
      setMessages(current => [...current, { role: "assistant", text: data.answer ?? (isBridal ? "I don’t have that detail yet. Please send an enquiry and Monika can confirm." : "I don’t have that detail yet. Please send an enquiry and Vani can confirm."), sources: data.sources }]);
    } catch {
      setMessages(current => [...current, { role: "assistant", text: serviceGuideAnswer(question) }]);
    } finally { setLoading(false); }
  }

  function send(event: FormEvent) { event.preventDefault(); void ask(input.trim()); }

  return <aside className="chat-widget" aria-label={isBridal ? "AI bridal concierge" : "AI creative concierge"}>
    {open && <section className="chat-window" aria-live="polite">
      <div className="chat-title"><div><span className="online-dot"/><span><strong>{isBridal ? "Bridal concierge" : "Creative concierge"}</strong><small>AI · grounded in the service guide</small></span></div><button aria-label="Close concierge" onClick={() => setOpen(false)}>×</button></div>
      <div className="chat-messages">{messages.map((message,index)=><div className={`message ${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span>{message.sources && message.sources.length > 0 && <small className="message-sources">Source: {message.sources.join(" · ")}</small>}{message.role === "assistant" && <div className="message-actions"><a href="#services" onClick={()=>setOpen(false)}>View services</a><a href="#enquire" onClick={()=>setOpen(false)}>Send enquiry</a><a href={contactUrl} target="_blank" rel="noreferrer">{isBridal ? "WhatsApp" : "Instagram"} ↗</a></div>}</div>)}{messages.length===1&&<div className="quick-prompts">{prompts.map(prompt=><button key={prompt} onClick={()=>void ask(prompt)}>{prompt}</button>)}</div>}{loading&&<p className="message assistant">Retrieving the service guide…</p>}</div>
      <form onSubmit={send}><input ref={inputRef} value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask about services or pricing…" aria-label={isBridal ? "Message the bridal concierge" : "Message the creative concierge"}/><button disabled={loading||!input.trim()}>Send</button></form>
      <p className="chat-disclaimer">AI can explain services; {isBridal ? "Monika confirms availability and final quotes." : "Vani confirms customisation, timelines and final quotes."}</p>
    </section>}
    <button className="chat-launcher" onClick={()=>{setOpen(current=>!current);setTimeout(()=>inputRef.current?.focus(),50)}} aria-expanded={open}>{open?"Close":<><span>✦</span> Ask the {isBridal ? "bridal" : "creative"} concierge</>}</button>
  </aside>;
}
