import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { JOB_MATCH_PROMPT } from "@/lib/ai/prompts";
import { scrapeJobPage } from "@/lib/firecrawl/client";
import { createServerClient } from "@/lib/supabase/server";
import { storeEmbeddings } from "@/lib/rag/embeddings";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import type { Profile } from "@/types/database";

export async function matchJobFromUrl(profile: Profile, jobUrl: string, resumeId?: string) {
  const { allowed } = await checkUsageLimit(profile, "job_match");
  if (!allowed) throw new Error("Monthly job match limit reached. Upgrade to Pro.");

  const supabase = createServerClient();
  const scraped = await scrapeJobPage(jobUrl);

  const { data: resume } = resumeId
    ? await supabase.from("resumes").select("raw_text").eq("id", resumeId).eq("user_id", profile.id).single()
    : await supabase.from("resumes").select("raw_text").eq("user_id", profile.id).eq("is_primary", true).single();

  if (!resume?.raw_text) throw new Error("Please upload a resume first.");

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      source: new URL(jobUrl).hostname,
      title: extractTitle(scraped.markdown),
      company: extractCompany(scraped.markdown),
      description: scraped.markdown.slice(0, 10000),
      url: jobUrl,
      remote: scraped.markdown.toLowerCase().includes("remote"),
    })
    .select()
    .single();

  if (jobError) throw new Error(jobError.message);

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: JOB_MATCH_PROMPT },
      {
        role: "user",
        content: `Resume:\n${resume.raw_text.slice(0, 6000)}\n\nJob Description:\n${scraped.markdown.slice(0, 6000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to match job");

  const match = JSON.parse(content);

  const { data: jobMatch, error } = await supabase
    .from("job_matches")
    .insert({
      user_id: profile.id,
      job_id: job.id,
      resume_id: resumeId ?? null,
      match_score: match.matchScore,
      missing_skills: match.missingSkills,
      learning_path: match.learningPath,
      likelihood: match.likelihood,
      why_match: match.whyMatch,
      apply_tips: match.applyTips,
    })
    .select("*, jobs(*)")
    .single();

  if (error) throw new Error(error.message);

  await storeEmbeddings(profile.id, "job_description", job.id, scraped.markdown, { url: jobUrl });
  await logUsage(profile.id, "job_match");

  return jobMatch;
}

export async function saveJob(profileId: string, jobId: string, isFavorite = false) {
  const supabase = createServerClient();
  const { error } = await supabase.from("saved_jobs").upsert({
    user_id: profileId,
    job_id: jobId,
    is_favorite: isFavorite,
  });
  if (error) throw new Error(error.message);
}

export async function getJobMatches(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("job_matches")
    .select("*, jobs(*)")
    .eq("user_id", userId)
    .order("match_score", { ascending: false });
  return data ?? [];
}

export async function getSavedJobs(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("saved_jobs")
    .select("*, jobs(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)/m);
  return match?.[1]?.slice(0, 200) ?? "Job Position";
}

function extractCompany(markdown: string): string {
  const match = markdown.match(/(?:company|employer|organization)[:\s]+([^\n]+)/i);
  return match?.[1]?.slice(0, 100) ?? "Company";
}
