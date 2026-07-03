import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getUserResumes } from "@/lib/services/resume-queries";
import { ResumeOptimizerPage } from "@/components/features/resume/resume-optimizer";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { Resume } from "@/types/database";

export default async function ResumePage() {
  try {
    const profile = await getOrCreateProfile();
    const resumes = (await getUserResumes(profile.id)) as Resume[];
    return <ResumeOptimizerPage resumes={resumes} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Resume page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
