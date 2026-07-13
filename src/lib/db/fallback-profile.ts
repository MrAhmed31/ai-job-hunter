import { createHash } from "crypto";
import type { Profile } from "@/types/database";

/** Deterministic UUID-like id derived from Clerk user id (stable across requests). */
export function profileIdFromClerkId(clerkId: string): string {
  const hex = createHash("sha256").update(`ai-job-hunter:${clerkId}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function buildFallbackProfile(input: {
  clerkId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}): Profile {
  const now = new Date().toISOString();
  return {
    id: profileIdFromClerkId(input.clerkId),
    clerk_id: input.clerkId,
    email: input.email,
    full_name: input.fullName,
    avatar_url: input.avatarUrl,
    desired_role: null,
    preferred_country: null,
    salary_min: null,
    salary_max: null,
    years_experience: null,
    subscription_tier: "free",
    subscription_status: "active",
    onboarding_completed: false,
    created_at: now,
    updated_at: now,
  };
}

export function isSupabaseUnreachable(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error ?? "");

  return /fetch failed|ENOTFOUND|ECONNREFUSED|Failed to fetch|EAI_AGAIN|network|Cannot reach Supabase|project URL looks dead|getaddrinfo|timed out/i.test(
    msg
  );
}
