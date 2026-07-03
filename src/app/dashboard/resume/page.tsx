import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getUserResumes } from "@/lib/services/resume";
import { ResumeOptimizerPage } from "@/components/features/resume/resume-optimizer";

export default async function ResumePage() {
  const profile = await getOrCreateProfile();
  const resumes = await getUserResumes(profile.id);
  return <ResumeOptimizerPage resumes={resumes as never[]} />;
}
