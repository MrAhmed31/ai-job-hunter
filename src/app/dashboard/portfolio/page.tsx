import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getPortfolioReviews } from "@/lib/services/portfolio";
import { PortfolioReviewPage } from "@/components/features/portfolio/portfolio-review";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { PortfolioReview } from "@/types/database";

export default async function PortfolioRoute() {
  try {
    const profile = await getOrCreateProfile();
    const reviews = (await getPortfolioReviews(profile.id)) as PortfolioReview[];
    return <PortfolioReviewPage reviews={reviews} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Portfolio page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
