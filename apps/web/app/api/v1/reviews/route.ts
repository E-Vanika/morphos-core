import { sheetsPost, sheetsReviews } from "../../../../lib/server-integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json({ reviews: await sheetsReviews() }); }
  catch (error) {
    console.error("Review read failed", error);
    return Response.json({ detail: error instanceof Error ? error.message : "Reviews could not be loaded.", reviews: [] }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const rating = Number(body.rating);
    if (name.length < 2 || comment.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ detail: "Enter your name, a rating from 1 to 5, and a comment of at least 10 characters." }, { status: 400 });
    await sheetsPost("new_review", { ...body, name, comment, rating });
    return Response.json({ status: "saved", message: "Thank you — your review is now visible." });
  } catch (error) {
    console.error("Review save failed", error);
    return Response.json({ detail: error instanceof Error ? error.message : "The review could not be saved." }, { status: 502 });
  }
}
