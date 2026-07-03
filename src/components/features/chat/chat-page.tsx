"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessageAction } from "@/actions/resume";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/database";

interface Props {
  initialMessages: ChatMessage[];
  conversationId: string | null;
}

export function ChatPage({ initialMessages, conversationId: initialConvId }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [conversationId, setConversationId] = useState(initialConvId);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isPending) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), conversation_id: conversationId ?? "", role: "user", content: userMessage, metadata: null, created_at: new Date().toISOString() },
    ]);

    startTransition(async () => {
      const result = await sendChatMessageAction(conversationId, userMessage);
      if (result.success && result.data) {
        setConversationId(result.data.conversationId);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), conversation_id: result.data!.conversationId, role: "assistant", content: result.data!.response, metadata: null, created_at: new Date().toISOString() },
        ]);
      } else {
        toast.error(result.error);
      }
    });
  };

  const suggestions = [
    "How can I improve my resume for tech roles?",
    "What should I prepare for a system design interview?",
    "How do I negotiate a higher salary?",
    "Tips for optimizing my LinkedIn profile",
  ];

  return (
    <>
      <DashboardHeader title="AI Career Assistant" />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="py-12 text-center">
                <Bot className="mx-auto h-12 w-12 text-violet-500" />
                <h2 className="mt-4 text-xl font-semibold">Your AI Career Copilot</h2>
                <p className="mt-2 text-muted-foreground">Ask about resumes, interviews, salary, and job search strategy.</p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <Button key={s} variant="outline" className="h-auto whitespace-normal p-3 text-left text-sm" onClick={() => setInput(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                    <Bot className="h-4 w-4 text-violet-500" />
                  </div>
                )}
                <Card className={cn("max-w-[80%]", msg.role === "user" ? "bg-violet-500/10" : "")}>
                  <CardContent className="p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </CardContent>
                </Card>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isPending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                </div>
                <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Thinking...</p></CardContent></Card>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-border/40 p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your career question..."
              className="min-h-[44px] resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="gradient" size="icon" disabled={isPending || !input.trim()} onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
