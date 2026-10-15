"use client";

import { FormEvent, useRef, useState } from "react";

type Message = { role: "assistant" | "user"; text: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";
const prompts = isBridal ? ["Compare bridal finishes", "What is included?", "What should I share?"] : ["What can I customise?", "How does pricing work?"];

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
      const data: { answer?: string } = await response.json();
      setMessages(current => [...current, { role: "assistant", text: data.answer ?? "I don’t have that detail yet. Please send an enquiry and Monika can confirm." }]);
    } catch {
      setMessages(current => [...current, { role: "assistant", text: "I’m temporarily unavailable. You can still send a private enquiry through the form." }]);
    } finally { setLoading(false); }
  }

  function send(event: FormEvent) { event.preventDefault(); void ask(input.trim()); }

  return <aside className="chat-widget" aria-label="AI bridal concierge">
    {open && <section className="chat-window" aria-live="polite">
      <div className="chat-title"><div><span className="online-dot"/><span><strong>{isBridal ? "Bridal concierge" : "Creative concierge"}</strong><small>AI · grounded in the service guide</small></span></div><button aria-label="Close concierge" onClick={() => setOpen(false)}>×</button></div>
      <div className="chat-messages">{messages.map((message,index)=><p className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</p>)}{messages.length===1&&<div className="quick-prompts">{prompts.map(prompt=><button key={prompt} onClick={()=>void ask(prompt)}>{prompt}</button>)}</div>}{loading&&<p className="message assistant">Reviewing the service guide…</p>}</div>
      <form onSubmit={send}><input ref={inputRef} value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask about services or pricing…" aria-label="Message the bridal concierge"/><button disabled={loading||!input.trim()}>Send</button></form>
      <p className="chat-disclaimer">AI can explain services; Monika confirms availability and final quotes.</p>
    </section>}
    <button className="chat-launcher" onClick={()=>{setOpen(current=>!current);setTimeout(()=>inputRef.current?.focus(),50)}} aria-expanded={open}>{open?"Close":<><span>✦</span> Ask the bridal concierge</>}</button>
  </aside>;
}
