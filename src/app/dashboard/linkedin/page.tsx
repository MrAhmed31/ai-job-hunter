import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getLinkedInReviews } from "@/lib/services/linkedin";
import { LinkedInReviewPage } from "@/components/features/linkedin/linkedin-review";

export default async function LinkedInRoute() {
  const profile = await getOrCreateProfile();
  const reviews = await getLinkedInReviews(profile.id);
  return <LinkedInReviewPage reviews={reviews as never[]} />;
}
