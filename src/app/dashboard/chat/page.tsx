import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getConversations, getConversationMessages } from "@/lib/services/chat";
import { ChatPage } from "@/components/features/chat/chat-page";

export default async function ChatRoute() {
  const profile = await getOrCreateProfile();
  const conversations = await getConversations(profile.id);
  const latestConv = conversations[0];
  const messages = latestConv ? await getConversationMessages(latestConv.id, profile.id) : [];

  return (
    <ChatPage
      initialMessages={messages as never[]}
      conversationId={latestConv?.id ?? null}
    />
  );
}
