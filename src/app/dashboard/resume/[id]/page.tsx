import type { ComponentProps } from "react";
import { notFound } from "next/navigation";
import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getResumeById } from "@/lib/services/resume";
import { ResumeDetailPage } from "@/components/features/resume/resume-detail";
import { DashboardError } from "@/components/layout/dashboard-error";

export default async function ResumeDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let resume: Awaited<ReturnType<typeof getResumeById>>;
  try {
    const profile = await getOrCreateProfile();
    resume = await getResumeById(profile.id, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Resume couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }

  if (!resume) notFound();
  return (
    <ResumeDetailPage
      resume={resume as ComponentProps<typeof ResumeDetailPage>["resume"]}
    />
  );
}
