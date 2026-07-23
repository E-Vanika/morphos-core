-- Return document names with vector matches so the AI response can disclose its sources.
drop function if exists public.match_knowledge_chunks(vector, int);

create function public.match_knowledge_chunks(
  query_embedding vector(768),
  match_count int default 4
)
returns table (id uuid, content text, filename text, similarity float)
language sql stable
as $$
  select
    chunks.id,
    chunks.content,
    documents.filename,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks as chunks
  join public.knowledge_documents as documents on documents.id = chunks.document_id
  where chunks.embedding is not null
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
