import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getCoverLetters } from "@/lib/services/cover-letter";
import { CoverLetterPage } from "@/components/features/cover-letter/cover-letter-page";
import { DashboardError } from "@/components/layout/dashboard-error";
import type { CoverLetter } from "@/types/database";

export default async function CoverLetterRoute() {
  try {
    const profile = await getOrCreateProfile();
    const letters = (await getCoverLetters(profile.id)) as CoverLetter[];
    return <CoverLetterPage letters={letters} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <DashboardError
        title="Cover letter page couldn't load"
        message={`${message}. If this mentions profiles or Supabase, confirm database/schema.sql was run in Supabase SQL Editor.`}
      />
    );
  }
}
