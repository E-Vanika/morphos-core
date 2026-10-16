export type KnowledgeChunk = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
};

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "bridal-finishes",
    title: "Monika Glam Up service guide — bridal finishes",
    content: "Matte Finish Bridal Look starts at ₹8,000. Soft Glam Bridal Look starts at ₹9,000. Skin Finish Bridal Look starts at ₹10,000. Glow Finish Bridal Look starts at ₹12,000.",
    keywords: ["bridal", "bride", "matte", "soft glam", "skin finish", "glow", "price", "cost", "compare"],
  },
  {
    id: "package-inclusions",
    title: "Monika Glam Up service guide — package inclusions",
    content: "A bridal look includes the selected makeup finish, bridal hairstyling or hairdo, and saree draping. Travel, lenses, eyelashes, special accessories, and customised requirements are quoted separately unless agreed otherwise.",
    keywords: ["include", "package", "hair", "hairstyle", "draping", "saree", "lashes", "lens", "travel", "accessories"],
  },
  {
    id: "occasion-services",
    title: "Monika Glam Up service guide — occasion services",
    content: "Bridesmaid makeup is ₹5,000. Bridesmaid hairstyling is ₹1,500. Party makeup starts at ₹3,500. Bridal hairstyling is ₹2,500. Saree draping is ₹1,000 and pre-pleating starts at ₹600.",
    keywords: ["bridesmaid", "party", "occasion", "hair", "hairstyle", "saree", "draping", "pre pleating", "price"],
  },
  {
    id: "booking-process",
    title: "Monika Glam Up booking policy",
    content: "The website form creates a private enquiry, not a confirmed booking. The client should provide event date, time, place, number of clients, preferred service, and relevant look details. Monika personally confirms availability, travel requirements, and the final quote.",
    keywords: ["book", "booking", "available", "availability", "date", "time", "venue", "place", "clients", "confirm", "enquiry"],
  },
];

const STOP_WORDS = new Set(["a", "an", "and", "are", "can", "do", "for", "how", "i", "in", "is", "it", "me", "of", "on", "the", "to", "what", "with", "you"]);

function terms(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9₹]+/g, " ").split(/\s+/).filter(term => term.length > 1 && !STOP_WORDS.has(term));
}

export function retrieveKnowledge(query: string, limit = 3) {
  const queryTerms = terms(query);
  return KNOWLEDGE_CHUNKS
    .map(chunk => {
      const title = chunk.title.toLowerCase();
      const keywords = chunk.keywords.join(" ").toLowerCase();
      const content = chunk.content.toLowerCase();
      const score = queryTerms.reduce((total, term) => total + (keywords.includes(term) ? 4 : 0) + (title.includes(term) ? 2 : 0) + (content.includes(term) ? 1 : 0), 0);
      return { ...chunk, score };
    })
    .filter(chunk => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
