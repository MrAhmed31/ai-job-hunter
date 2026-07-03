"use client";

import { useState, useTransition } from "react";
import { Loader2, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { reviewPortfolioAction } from "@/actions/features";
import { cn, scoreBg } from "@/lib/utils";
import type { PortfolioReview, PortfolioAnalysis } from "@/types/database";

interface Props {
  reviews: PortfolioReview[];
}

export function PortfolioReviewPage({ reviews }: Props) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"github" | "website" | "behance" | "dribbble" | "other">("github");
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReview = () => {
    if (!url.trim()) return;
    startTransition(async () => {
      const result = await reviewPortfolioAction(url, type);
      if (result.success && result.data) {
        setAnalysis(result.data.analysis);
        toast.success("Portfolio reviewed!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const displayAnalysis = analysis ?? (reviews[0]?.analysis as PortfolioAnalysis | null);

  return (
    <>
      <DashboardHeader title="Portfolio Review" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">Portfolio Review</h2>
            <p className="text-muted-foreground">Analyze your GitHub, website, or design portfolio with AI.</p>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label>Portfolio Type</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["github", "website", "behance", "dribbble", "other"] as const).map((t) => (
                    <Button key={t} variant={type === t ? "default" : "outline"} size="sm" onClick={() => setType(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="portfolio-url">Portfolio URL</Label>
                  <Input id="portfolio-url" placeholder="https://github.com/username" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" />
                </div>
                <Button variant="gradient" className="mt-auto" disabled={isPending} onClick={handleReview}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  <span className="ml-2">Review</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {displayAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Portfolio Score</h3>
                <Badge className={cn("text-lg px-4", scoreBg(displayAnalysis.overallScore))}>
                  {displayAnalysis.overallScore}/100
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Projects", score: displayAnalysis.projects.score },
                  { label: "Code Quality", score: displayAnalysis.codeQuality.score },
                  { label: "README", score: displayAnalysis.readme.score },
                  { label: "UI", score: displayAnalysis.ui.score },
                  { label: "UX", score: displayAnalysis.ux.score },
                  { label: "SEO", score: displayAnalysis.seo.score },
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="flex items-center justify-between pt-6">
                      <span className="text-sm">{item.label}</span>
                      <span className={cn("font-bold", scoreBg(item.score))}>{item.score}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle>Suggestions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {displayAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
