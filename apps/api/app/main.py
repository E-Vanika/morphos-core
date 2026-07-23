import os
from io import BytesIO
from typing import Annotated

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
from pypdf import PdfReader
from supabase import Client, create_client

from .domain import get_profile
from .skills import SKILLS

app = FastAPI(title="Morphos Agent API", version="0.1.0")
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    domain: str = "professional-services"


class ChatResponse(BaseModel):
    answer: str
    skills_available: list[str]


class OrderRequest(BaseModel):
    service: str = Field(pattern="^(art-craft|bridal-makeup)$")
    customer_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=6, max_length=30)
    event_date: str | None = None
    details: str | None = Field(default=None, max_length=2000)


def supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Supabase is not configured.")
    return create_client(url, key)


def gemini_client() -> genai.Client:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="Gemini is not configured.")
    return genai.Client(api_key=key)


def embed(text: str) -> list[float]:
    result = gemini_client().models.embed_content(model="gemini-embedding-001", contents=text)
    return list(result.embeddings[0].values)


def require_admin(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sign in as an administrator to upload knowledge.")
    token = authorization.removeprefix("Bearer ")
    try:
        user = supabase_client().auth.get_user(token).user
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid access token.") from error
    admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "").lower()
    if not user or not user.email or user.email.lower() != admin_email:
        raise HTTPException(status_code=403, detail="Only the configured administrator can upload knowledge.")
    return user.id


def require_mcp_key(key: str | None) -> None:
    """Protect machine-to-machine skill discovery when an MCP key is configured."""
    configured_key = os.getenv("MCP_API_KEY")
    if configured_key and key != configured_key:
        raise HTTPException(status_code=401, detail="A valid X-MCP-Key is required.")


def retrieve_context(message: str) -> str:
    try:
        rows = supabase_client().rpc("match_knowledge_chunks", {"query_embedding": embed(message), "match_count": 4}).execute().data
    except Exception:
        return ""
    return "\n\n".join(row["content"] for row in rows if row.get("content"))


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "morphos-agent"}


@app.get("/api/v1/skills")
def skills(x_mcp_key: Annotated[str | None, Header()] = None) -> list[dict[str, str]]:
    require_mcp_key(x_mcp_key)
    return [{"id": skill.id, "description": skill.description, "input_hint": skill.input_hint} for skill in SKILLS]


@app.post("/api/v1/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    profile = get_profile(request.domain)
    context = retrieve_context(request.message)
    if os.getenv("GEMINI_API_KEY"):
        prompt = f"{profile.system_prompt}\n\nApproved knowledge:\n{context or 'No uploaded knowledge yet.'}\n\nVisitor question: {request.message}"
        try:
            answer = gemini_client().models.generate_content(model="gemini-2.5-flash", contents=prompt).text or "I could not generate an answer from the approved knowledge."
        except Exception:
            answer = "I could not reach the AI provider just now. Please try again shortly."
    else:
        answer = f"I am the {profile.assistant_name}. Configure Gemini and upload knowledge to answer specific questions."
    return ChatResponse(answer=answer, skills_available=[skill.id for skill in SKILLS])


@app.post("/api/v1/orders")
def create_order(request: OrderRequest) -> dict[str, str]:
    supabase_client().table("order_requests").insert(request.model_dump()).execute()
    return {"status": "received"}


FALLBACK_GALLERY_IMAGES: dict[str, list[str]] = {
    "craft": [
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.31.17%20PM%20(1).jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS4zMS4xNyBQTSAoMSkuanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQ4MTM0NTksImV4cCI6MTgxNjM0OTQ1OX0.OlOsEWXng27pPVtIWJ8N3a1mIqD94wWaSNidqk9sb68",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.31.17%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS4zMS4xNyBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzUyNywiZXhwIjoxODE2MzQ5NTI3fQ.bYmtbUW9uqD7K2glY_7IgkDCWFRi79tmIVrY0eQn7F0",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.40.21%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS40MC4yMSBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzU0NiwiZXhwIjoxODE2MzQ5NTQ2fQ.97vfZ1qaH8T2TQXCQVqzWOQGH4ZjRZLiG6jooGD1ifM",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/sign/Art%20and%20craft/WhatsApp%20Image%202026-07-23%20at%205.40.22%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNjVmNDQ2Ni0zMDg0LTQyYjUtODE1Ny1jMWFlMjIzMDQ4ZDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcnQgYW5kIGNyYWZ0L1doYXRzQXBwIEltYWdlIDIwMjYtMDctMjMgYXQgNS40MC4yMiBQTS5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDgxMzU3MywiZXhwIjoxODE2MzQ5NTczfQ.VNoQeOSHluvq5sts7ZfL5VFhvXqNjospoW25_GXA4pM",
    ],
    "bridal": [
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.01%20PM.jpeg",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.02%20PM%20(1).jpeg",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.35.02%20PM.jpeg",
        "https://frmhbxqxbdyfvatubvul.supabase.co/storage/v1/object/public/Monika%20glamup/WhatsApp%20Image%202026-07-23%20at%205.38.39%20PM%20(1).jpeg",
    ],
}


@app.get("/api/v1/gallery")
def gallery(site: str) -> dict[str, list[str]]:
    bucket = os.getenv("BRIDAL_BUCKET", "Monika glamup") if site == "bridal" else os.getenv("CRAFTS_BUCKET", "Art and craft")
    storage = supabase_client().storage.from_(bucket)
    files_response = storage.list("", {"limit": 100})
    files = getattr(files_response, "data", files_response) or []
    image_extensions = (".jpg", ".jpeg", ".png", ".webp")
    images: list[str] = []
    for item in files:
        if not isinstance(item, dict):
            continue
        name = item.get("name", "")
        if not name.lower().endswith(image_extensions):
            continue
        public_result = storage.get_public_url(name)
        public_data = getattr(public_result, "data", public_result)
        if isinstance(public_data, dict):
            public_url = public_data.get("public_url") or public_data.get("publicUrl")
        else:
            public_url = str(public_data)
        if public_url:
            images.append(public_url)
    if not images:
        images = FALLBACK_GALLERY_IMAGES.get(site, [])
    return {"images": images}


@app.post("/api/v1/admin/documents")
async def upload_document(
    file: Annotated[UploadFile, File(...)],
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    if file.content_type not in {"text/plain", "text/markdown", "application/pdf"}:
        raise HTTPException(status_code=415, detail="Only TXT, Markdown, and PDF documents are accepted.")
    if not file.filename:
        raise HTTPException(status_code=400, detail="A filename is required.")
    admin_id = require_admin(authorization)
    raw = await file.read()
    if len(raw) > 5_000_000:
        raise HTTPException(status_code=413, detail="Documents must be 5 MB or smaller on the free-tier demo.")
    if file.content_type == "application/pdf":
        text = "\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(raw)).pages)
    else:
        text = raw.decode("utf-8", errors="replace")
    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text was found in the document.")
    client = supabase_client()
    path = f"{admin_id}/{file.filename}"
    client.storage.from_("knowledge").upload(path, raw, {"content-type": file.content_type or "application/octet-stream", "upsert": "true"})
    document = client.table("knowledge_documents").insert({"domain_id": os.getenv("DOMAIN_PRESET", "professional-services"), "storage_path": path, "filename": file.filename, "uploaded_by": admin_id}).execute().data[0]
    chunks = [text[index:index + 1200] for index in range(0, min(len(text), 24_000), 1000)]
    client.table("knowledge_chunks").insert([{"document_id": document["id"], "content": chunk, "embedding": embed(chunk)} for chunk in chunks]).execute()
    return {"status": "indexed", "filename": file.filename, "chunks": str(len(chunks))}
