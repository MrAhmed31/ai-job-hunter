import { getOpenAI, EMBEDDING_MODEL } from "@/lib/ai/openai";
import { chunkText, cleanText } from "@/lib/rag/chunker";
import { createServerClient } from "@/lib/supabase/server";
import type { EmbeddingSource } from "@/types/database";

export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export async function storeEmbeddings(
  userId: string,
  sourceType: EmbeddingSource,
  sourceId: string,
  text: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();
  const cleaned = cleanText(text);
  const chunks = chunkText(cleaned);

  await supabase
    .from("embeddings")
    .delete()
    .eq("user_id", userId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await createEmbedding(chunks[i]);
    await supabase.from("embeddings").insert({
      user_id: userId,
      source_type: sourceType,
      source_id: sourceId,
      chunk_index: i,
      content: chunks[i],
      metadata: { ...metadata, chunkIndex: i, totalChunks: chunks.length },
      embedding,
    });
  }
}

export interface RetrievedChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  source_type: EmbeddingSource;
  similarity: number;
}

export async function retrieveContext(
  userId: string,
  query: string,
  options?: { matchCount?: number; sourceType?: EmbeddingSource }
): Promise<RetrievedChunk[]> {
  const supabase = createServerClient();
  const queryEmbedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc("match_embeddings", {
    query_embedding: queryEmbedding,
    match_count: options?.matchCount ?? 5,
    filter_user_id: userId,
    filter_source_type: options?.sourceType ?? null,
  });

  if (error) {
    console.error("RAG retrieval error:", error);
    return [];
  }

  return (data ?? []) as RetrievedChunk[];
}

export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c, i) => `[Context ${i + 1} - ${c.source_type}]\n${c.content}`)
    .join("\n\n---\n\n");
}
