import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getPortfolioReviews } from "@/lib/services/portfolio";
import { PortfolioReviewPage } from "@/components/features/portfolio/portfolio-review";

export default async function PortfolioRoute() {
  const profile = await getOrCreateProfile();
  const reviews = await getPortfolioReviews(profile.id);
  return <PortfolioReviewPage reviews={reviews as never[]} />;
}
