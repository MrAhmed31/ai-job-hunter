import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getInterviewSessions } from "@/lib/services/interview";
import { InterviewPage } from "@/components/features/interview/interview-page";

export default async function InterviewRoute() {
  const profile = await getOrCreateProfile();
  const sessions = await getInterviewSessions(profile.id);
  return <InterviewPage sessions={sessions as never[]} />;
}
