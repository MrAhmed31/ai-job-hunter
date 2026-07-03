import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getInterviewSessions } from "@/lib/services/interview";
import { InterviewPage } from "@/components/features/interview/interview-page";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { InterviewSession } from "@/types/database";

export default async function InterviewRoute() {
  try {
    const profile = await getOrCreateProfile();
    const sessions = (await getInterviewSessions(profile.id)) as InterviewSession[];
    return <InterviewPage sessions={sessions} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Interview page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
