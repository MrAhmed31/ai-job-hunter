import { createServerClient } from "@/lib/supabase/server";
import { FREE_TIER_LIMITS } from "@/types/index";
import type { Profile, SubscriptionTier } from "@/types/database";

export async function checkUsageLimit(
  profile: Profile,
  feature: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (profile.subscription_tier === "pro") {
    return { allowed: true, remaining: Infinity };
  }

  const limit = FREE_TIER_LIMITS[feature] ?? 0;
  const supabase = createServerClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("feature", feature)
    .gte("created_at", startOfMonth.toISOString());

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);
  return { allowed: remaining > 0, remaining };
}

export async function logUsage(
  userId: string,
  feature: string,
  tokensUsed = 0,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    feature,
    tokens_used: tokensUsed,
    metadata,
  });
}

export function getTierLimits(tier: SubscriptionTier) {
  if (tier === "pro") {
    return {
      resume_review: Infinity,
      job_match: Infinity,
      cover_letter: Infinity,
      interview_session: Infinity,
      linkedin_review: Infinity,
      portfolio_review: Infinity,
    };
  }
  return FREE_TIER_LIMITS;
}
