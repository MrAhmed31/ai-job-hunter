import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { COVER_LETTER_PROMPT } from "@/lib/ai/prompts";
import { scrapeCompanyWebsite } from "@/lib/firecrawl/client";
import { createServerClient } from "@/lib/supabase/server";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import type { Profile, CoverLetterTone } from "@/types/database";

export async function generateCoverLetter(
  profile: Profile,
  options: {
    jobId?: string;
    resumeId?: string;
    companyUrl?: string;
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    tone: CoverLetterTone;
    version: "short" | "long";
  }
) {
  const { allowed } = await checkUsageLimit(profile, "cover_letter");
  if (!allowed) throw new Error("Monthly cover letter limit reached. Upgrade to Pro.");

  const supabase = createServerClient();

  const { data: resume } = options.resumeId
    ? await supabase.from("resumes").select("raw_text").eq("id", options.resumeId).single()
    : await supabase.from("resumes").select("raw_text").eq("user_id", profile.id).eq("is_primary", true).single();

  let companyContext = "";
  if (options.companyUrl) {
    try {
      const scraped = await scrapeCompanyWebsite(options.companyUrl);
      companyContext = scraped.markdown.slice(0, 3000);
    } catch {
      // Continue without company context
    }
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: COVER_LETTER_PROMPT(options.tone, options.version) },
      {
        role: "user",
        content: `Role: ${options.jobTitle} at ${options.companyName}\n\nResume:\n${resume?.raw_text?.slice(0, 4000) ?? "N/A"}\n\nJob Description:\n${options.jobDescription?.slice(0, 3000) ?? "N/A"}\n\nCompany Info:\n${companyContext}`,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate cover letter");

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({
      user_id: profile.id,
      job_id: options.jobId ?? null,
      resume_id: options.resumeId ?? null,
      title: `Cover Letter - ${options.companyName}`,
      content,
      tone: options.tone,
      version: options.version,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await logUsage(profile.id, "cover_letter");

  return data;
}

export async function getCoverLetters(userId: string) {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}
