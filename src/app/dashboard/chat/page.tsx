import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getConversations, getConversationMessages } from "@/lib/services/chat";
import { ChatPage } from "@/components/features/chat/chat-page";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { ChatMessage } from "@/types/database";

export default async function ChatRoute() {
  try {
    const profile = await getOrCreateProfile();
    const conversations = await getConversations(profile.id);
    const latestConv = conversations[0];
    const messages = latestConv
      ? ((await getConversationMessages(latestConv.id, profile.id)) as ChatMessage[])
      : [];

    return (
      <ChatPage
        initialMessages={messages}
        conversationId={latestConv?.id ?? null}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Chat page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
