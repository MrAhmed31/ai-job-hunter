import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { LINKEDIN_REVIEW_PROMPT } from "@/lib/ai/prompts";
import { scrapeLinkedIn } from "@/lib/firecrawl/client";
import { createServerClient } from "@/lib/supabase/server";
import { storeEmbeddings } from "@/lib/rag/embeddings";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import type { Profile, LinkedInAnalysis } from "@/types/database";

export async function reviewLinkedInProfile(profile: Profile, linkedinUrl: string) {
  const { allowed } = await checkUsageLimit(profile, "linkedin_review");
  if (!allowed) throw new Error("Monthly LinkedIn review limit reached. Upgrade to Pro.");

  const scraped = await scrapeLinkedIn(linkedinUrl);

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: LINKEDIN_REVIEW_PROMPT },
      { role: "user", content: `LinkedIn URL: ${linkedinUrl}\n\nProfile Data:\n${scraped.markdown.slice(0, 12000)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to analyze LinkedIn profile");

  const analysis = JSON.parse(content) as LinkedInAnalysis;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("linkedin_reviews")
    .insert({
      user_id: profile.id,
      linkedin_url: linkedinUrl,
      scraped_data: { markdown: scraped.markdown, metadata: scraped.metadata },
      overall_score: analysis.overallScore,
      analysis,
      suggestions: { connectionStrategy: analysis.connectionStrategy, networkingTips: analysis.networkingTips },
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await storeEmbeddings(profile.id, "linkedin", data.id, scraped.markdown, { url: linkedinUrl });
  await logUsage(profile.id, "linkedin_review");

  return { reviewId: data.id, analysis };
}

export async function getLinkedInReviews(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("linkedin_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
