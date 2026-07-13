import { getOpenAI, CHAT_MODEL } from "@/lib/ai/openai";
import { CAREER_CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { retrieveContext, formatContextForPrompt } from "@/lib/rag/embeddings";
import { createServerClient } from "@/lib/supabase/server";
import { logUsage } from "@/lib/services/usage";
import type { Profile } from "@/types/database";

export async function sendChatMessage(
  profile: Profile,
  conversationId: string | null,
  message: string
): Promise<{ conversationId: string; response: string }> {
  const supabase = createServerClient();
  let convId: string;

  if (conversationId) {
    convId = conversationId;
  } else {
    const { data: conv, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: profile.id,
        title: message.slice(0, 60),
      })
      .select()
      .single();
    if (error || !conv) throw new Error("Failed to create conversation");
    convId = conv.id;
  }

  await supabase.from("chat_messages").insert({
    conversation_id: convId,
    role: "user",
    content: message,
  });

  const context = await retrieveContext(profile.id, message, { matchCount: 5 });
  const contextStr = formatContextForPrompt(context);

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(20);

  const openai = getOpenAI();
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: contextStr
        ? `${CAREER_CHAT_SYSTEM_PROMPT}\n\nRelevant context from user's documents:\n${contextStr}`
        : CAREER_CHAT_SYSTEM_PROMPT,
    },
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  });

  const assistantMessage = response.choices[0]?.message?.content ?? "I couldn't generate a response.";
  const tokensUsed = response.usage?.total_tokens ?? 0;

  await supabase.from("chat_messages").insert({
    conversation_id: convId,
    role: "assistant",
    content: assistantMessage,
    metadata: { tokensUsed },
  });

  await logUsage(profile.id, "chat", tokensUsed);

  return { conversationId: convId, response: assistantMessage };
}

export async function getConversations(userId: string) {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getConversationMessages(conversationId: string, userId: string) {
  try {
    const supabase = createServerClient();
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (!conv) return [];

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}
