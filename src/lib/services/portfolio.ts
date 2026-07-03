import { getOpenAI, ANALYSIS_MODEL } from "@/lib/ai/openai";
import { PORTFOLIO_REVIEW_PROMPT } from "@/lib/ai/prompts";
import { scrapePortfolio } from "@/lib/firecrawl/client";
import { createServerClient } from "@/lib/supabase/server";
import { storeEmbeddings } from "@/lib/rag/embeddings";
import { checkUsageLimit, logUsage } from "@/lib/services/usage";
import type { Profile, PortfolioAnalysis } from "@/types/database";

export async function reviewPortfolio(
  profile: Profile,
  portfolioUrl: string,
  portfolioType: "github" | "website" | "behance" | "dribbble" | "other"
) {
  const { allowed } = await checkUsageLimit(profile, "portfolio_review");
  if (!allowed) throw new Error("Monthly portfolio review limit reached. Upgrade to Pro.");

  let scrapedData = await scrapePortfolio(portfolioUrl);

  if (portfolioType === "github") {
    try {
      const githubPath = portfolioUrl.replace(/https?:\/\/(www\.)?github\.com\//, "");
      const apiRes = await fetch(`https://api.github.com/users/${githubPath.split("/")[0]}/repos?sort=updated&per_page=10`);
      if (apiRes.ok) {
        const repos = await apiRes.json();
        scrapedData = {
          markdown: `${scrapedData.markdown}\n\n## GitHub Repositories\n${repos.map((r: { name: string; description: string; stargazers_count: number; language: string }) => `- **${r.name}**: ${r.description ?? "No description"} (${r.stargazers_count} stars, ${r.language ?? "N/A"})`).join("\n")}`,
          metadata: { ...scrapedData.metadata, repos: repos.length },
        };
      }
    } catch {
      // Continue with Firecrawl data only
    }
  }

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: "system", content: PORTFOLIO_REVIEW_PROMPT },
      { role: "user", content: `Portfolio URL: ${portfolioUrl}\nType: ${portfolioType}\n\nData:\n${scrapedData.markdown.slice(0, 12000)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to analyze portfolio");

  const analysis = JSON.parse(content) as PortfolioAnalysis;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("portfolio_reviews")
    .insert({
      user_id: profile.id,
      portfolio_url: portfolioUrl,
      portfolio_type: portfolioType,
      scraped_data: { markdown: scrapedData.markdown },
      overall_score: analysis.overallScore,
      analysis,
      suggestions: { items: analysis.suggestions },
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await storeEmbeddings(profile.id, "portfolio", data.id, scrapedData.markdown, { url: portfolioUrl });
  await logUsage(profile.id, "portfolio_review");

  return { reviewId: data.id, analysis };
}

export async function getPortfolioReviews(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("portfolio_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
