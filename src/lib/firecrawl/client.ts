import Firecrawl from "@mendable/firecrawl-js";

let firecrawlClient: Firecrawl | null = null;

export function getFirecrawl(): Firecrawl {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }
    firecrawlClient = new Firecrawl({ apiKey });
  }
  return firecrawlClient;
}

export interface ScrapeResult {
  markdown: string;
  metadata: Record<string, unknown>;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const firecrawl = getFirecrawl();
  const result = await firecrawl.scrapeUrl(url, {
    formats: ["markdown"],
  });

  return {
    markdown: result.markdown ?? "",
    metadata: (result.metadata as Record<string, unknown>) ?? {},
  };
}

export async function scrapeJobPage(url: string): Promise<ScrapeResult> {
  return scrapeUrl(url);
}

export async function scrapeLinkedIn(url: string): Promise<ScrapeResult> {
  return scrapeUrl(url);
}

export async function scrapePortfolio(url: string): Promise<ScrapeResult> {
  return scrapeUrl(url);
}

export async function scrapeCompanyWebsite(url: string): Promise<ScrapeResult> {
  return scrapeUrl(url);
}
