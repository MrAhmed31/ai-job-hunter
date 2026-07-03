import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getJobMatches, getSavedJobs } from "@/lib/services/jobs";
import { JobsPage } from "@/components/features/jobs/jobs-page";

export default async function JobsRoute() {
  const profile = await getOrCreateProfile();
  const [matches, saved] = await Promise.all([
    getJobMatches(profile.id),
    getSavedJobs(profile.id),
  ]);
  return <JobsPage matches={matches as never[]} savedCount={saved.length} />;
}
