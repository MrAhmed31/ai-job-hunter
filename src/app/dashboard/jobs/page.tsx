import type { ComponentProps } from "react";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getJobMatches, getSavedJobs } from "@/lib/services/jobs";
import { JobsPage } from "@/components/features/jobs/jobs-page";
import { DashboardError } from "@/components/layout/dashboard-error";

export default async function JobsRoute() {
  try {
    const profile = await getOrCreateProfile();
    const [matches, saved] = await Promise.all([
      getJobMatches(profile.id),
      getSavedJobs(profile.id),
    ]);
    return (
      <JobsPage
        matches={matches as ComponentProps<typeof JobsPage>["matches"]}
        savedCount={saved.length}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Jobs page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
