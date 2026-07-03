"use client";

import { useState, useTransition } from "react";
import { Loader2, Briefcase, Bookmark, Target } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { matchJobAction, saveJobAction } from "@/actions/features";
import { cn, scoreBg } from "@/lib/utils";

interface JobMatch {
  id: string;
  job_id: string;
  match_score: number | null;
  missing_skills: string[] | null;
  learning_path: string[] | null;
  likelihood: string | null;
  why_match: string | null;
  apply_tips: string[] | null;
  jobs: { title: string; company: string; url: string; location: string | null; remote: boolean } | null;
}

interface Props {
  matches: JobMatch[];
  savedCount: number;
}

export function JobsPage({ matches, savedCount }: Props) {
  const [jobUrl, setJobUrl] = useState("");
  const [latestMatch, setLatestMatch] = useState<JobMatch | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleMatch = () => {
    if (!jobUrl.trim()) return;
    startTransition(async () => {
      const result = await matchJobAction(jobUrl);
      if (result.success && result.data) {
        setLatestMatch(result.data as JobMatch);
        toast.success("Job matched!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSave = (match: JobMatch) => {
    if (!match.job_id) return;
    startTransition(async () => {
      const result = await saveJobAction(match.job_id, true);
      if (result.success) toast.success("Job saved!");
      else toast.error(result.error);
    });
  };

  const allMatches = latestMatch ? [latestMatch, ...matches.filter((m) => m.id !== latestMatch.id)] : matches;

  return (
    <>
      <DashboardHeader title="Job Matching" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">AI Job Matching</h2>
            <p className="text-muted-foreground">Paste a job URL to get match score, missing skills, and apply tips.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="job-url">Job Posting URL</Label>
                  <Input id="job-url" placeholder="https://linkedin.com/jobs/..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} className="mt-1" />
                </div>
                <Button variant="gradient" className="mt-auto" disabled={isPending} onClick={handleMatch}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                  <span className="ml-2">Match</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            {savedCount} saved jobs
          </div>

          <div className="space-y-4">
            {allMatches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{match.jobs?.title ?? "Job"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{match.jobs?.company}</p>
                    </div>
                    {match.match_score !== null && (
                      <Badge className={cn("text-base px-3", scoreBg(match.match_score))}>{match.match_score}% Match</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {match.why_match && <p className="text-sm">{match.why_match}</p>}
                  {match.missing_skills && match.missing_skills.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {match.missing_skills.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
                      </div>
                    </div>
                  )}
                  {match.apply_tips && match.apply_tips.length > 0 && (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {match.apply_tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    {match.jobs?.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={match.jobs.url} target="_blank" rel="noopener noreferrer">View Job</a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleSave(match)}>
                      <Bookmark className="mr-1 h-3 w-3" /> Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {allMatches.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No job matches yet. Paste a job URL to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
