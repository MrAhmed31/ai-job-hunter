import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getLinkedInReviews } from "@/lib/services/linkedin";
import { LinkedInReviewPage } from "@/components/features/linkedin/linkedin-review";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { LinkedInReview } from "@/types/database";

export default async function LinkedInRoute() {
  try {
    const profile = await getOrCreateProfile();
    const reviews = (await getLinkedInReviews(profile.id)) as LinkedInReview[];
    return <LinkedInReviewPage reviews={reviews} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="LinkedIn page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
