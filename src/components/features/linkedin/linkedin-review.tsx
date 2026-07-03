"use client";

import { useState, useTransition } from "react";
import { Loader2, Network, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { reviewLinkedInAction } from "@/actions/features";
import { cn, scoreBg, formatDate } from "@/lib/utils";
import type { LinkedInReview, LinkedInAnalysis } from "@/types/database";

interface Props {
  reviews: LinkedInReview[];
}

export function LinkedInReviewPage({ reviews }: Props) {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReview = () => {
    if (!url.trim()) return;
    startTransition(async () => {
      const result = await reviewLinkedInAction(url);
      if (result.success && result.data) {
        setAnalysis(result.data.analysis);
        toast.success("LinkedIn profile reviewed!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const displayAnalysis = analysis ?? (reviews[0]?.analysis as LinkedInAnalysis | null);

  return (
    <>
      <DashboardHeader title="LinkedIn Review" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">LinkedIn Profile Review</h2>
            <p className="text-muted-foreground">Paste your LinkedIn URL for AI-powered profile optimization.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin-url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button variant="gradient" className="mt-auto" disabled={isPending} onClick={handleReview}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
                  <span className="ml-2">Review</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {displayAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <Badge className={cn("text-lg px-4", scoreBg(displayAnalysis.overallScore))}>
                  {displayAnalysis.overallScore}/100
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Headline", score: displayAnalysis.headlineStrength.score },
                  { label: "SEO", score: displayAnalysis.seo.score },
                  { label: "Keywords", score: displayAnalysis.keywordOptimization.score },
                  { label: "Recruiter Appeal", score: displayAnalysis.recruiterAppeal.score },
                  { label: "Completeness", score: displayAnalysis.profileCompleteness.score },
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
                <CardHeader><CardTitle>Better Headline</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{displayAnalysis.betterHeadline}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Better About Section</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{displayAnalysis.betterAbout}</p></CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Networking Tips</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {displayAnalysis.networkingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {reviews.length > 0 && !displayAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reviews.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm truncate">{r.linkedin_url}</span>
                    <div className="flex items-center gap-2">
                      {r.overall_score && <Badge className={scoreBg(r.overall_score)}>{r.overall_score}</Badge>}
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
