"use client";

import { FormEvent, useState } from "react";

type Message = { role: "assistant" | "user"; text: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const isBridal = process.env.NEXT_PUBLIC_SITE_KIND === "bridal";
const assistantName = isBridal ? "Monika Glam Up assistant" : "Crafts by Vani assistant";
const welcome = isBridal ? "Hi! Ask about bridal makeup, hairstyling, prices or your date." : "Hi! Ask about pencil art, embroidery, paintings or a custom order.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: welcome }]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setMessages(current => [...current, { role: "user", text: question }]);
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, domain: isBridal ? "bridal-makeup" : "art-craft" }) });
      if (!response.ok) throw new Error("Chat request failed");
      const data: { answer?: string } = await response.json();
      setMessages(current => [...current, { role: "assistant", text: data.answer ?? "I could not generate an answer." }]);
    } catch {
      setMessages(current => [...current, { role: "assistant", text: "I'm temporarily offline. Please try again after the API finishes deploying." }]);
    } finally { setLoading(false); }
  }

  return <aside className="chat-widget" aria-label="AI concierge">
    {open && <section className="chat-window" aria-live="polite">
      <div className="chat-title"><div><span className="online-dot"/>{assistantName}</div><button aria-label="Close chat" onClick={() => setOpen(false)}>×</button></div>
      <div className="chat-messages">{messages.map((message, index) => <p className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</p>)}{loading && <p className="message assistant">Thinking…</p>}</div>
      <form onSubmit={send}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask anything…" aria-label="Chat message"/><button disabled={loading}>Send</button></form>
    </section>}
    <button className="chat-launcher" onClick={() => setOpen(current => !current)} aria-expanded={open}>{open ? "Close" : "Ask AI ✦"}</button>
  </aside>;
}
