import { getOrCreateProfile } from "@/lib/clerk/auth";
import { getCoverLetters } from "@/lib/services/cover-letter";
import { CoverLetterPage } from "@/components/features/cover-letter/cover-letter-page";

export default async function CoverLetterRoute() {
  const profile = await getOrCreateProfile();
  const letters = await getCoverLetters(profile.id);
  return <CoverLetterPage letters={letters as never[]} />;
}
