import { notFound } from "next/navigation";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getResumeById } from "@/lib/services/resume";
import { ResumeDetailPage } from "@/components/features/resume/resume-detail";

export default async function ResumeDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getOrCreateProfile();
  const resume = await getResumeById(profile.id, id);
  if (!resume) notFound();
  return <ResumeDetailPage resume={resume as never} />;
}
