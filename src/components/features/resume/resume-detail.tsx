"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateResumeVersionAction } from "@/actions/resume";
import { cn, scoreBg } from "@/lib/utils";
import type { ResumeAnalysis, ResumeVersionType } from "@/types/database";

const VERSION_TYPES: { type: ResumeVersionType; label: string }[] = [
  { type: "ats", label: "ATS Version" },
  { type: "modern", label: "Modern" },
  { type: "executive", label: "Executive" },
  { type: "student", label: "Student" },
  { type: "internship", label: "Internship" },
];

interface Props {
  resume: {
    id: string;
    title: string;
    raw_text: string | null;
    ats_score: number | null;
    analysis: ResumeAnalysis | null;
    resume_versions?: { version_type: string; content: string }[];
  };
}

export function ResumeDetailPage({ resume }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [generatedVersions, setGeneratedVersions] = useState<Record<string, string>>({});
  const analysis = resume.analysis;

  const generateVersion = (versionType: ResumeVersionType) => {
    startTransition(async () => {
      const result = await generateResumeVersionAction(resume.id, versionType);
      if (result.success && result.data) {
        setGeneratedVersions((prev) => ({ ...prev, [versionType]: result.data!.content }));
        toast.success(`${versionType} version generated!`);
      } else {
        toast.error(result.error);
      }
    });
  };

  if (!analysis) {
    return (
      <>
        <DashboardHeader title="Resume Analysis" />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Analysis not available for this resume.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Resume Analysis" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/resume")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resumes
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{resume.title}</h2>
              <p className="text-muted-foreground">ATS Analysis & Improvements</p>
            </div>
            <Badge className={cn("text-lg px-4 py-1", scoreBg(analysis.atsScore))}>
              {analysis.atsScore}/100
            </Badge>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Progress value={analysis.atsScore} className="flex-1" />
                <span className="font-semibold">ATS Score</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Formatting", score: analysis.formatting.score },
              { label: "Grammar", score: analysis.grammar.score },
              { label: "Keywords", score: analysis.keywords.score },
              { label: "Achievements", score: analysis.achievements.score },
              { label: "Action Verbs", score: analysis.actionVerbs.score },
              { label: "Readability", score: analysis.readability.score },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={cn("text-2xl font-bold", scoreBg(item.score))}>{item.score}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="suggestions">
            <TabsList>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="views">Perspectives</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Overall Suggestions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.overallSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {analysis.missingSkills.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Missing Skills</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill) => (
                      <Badge key={skill} variant="warning">{skill}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Found Keywords</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysis.keywords.found.map((kw) => (
                    <Badge key={kw} variant="success">{kw}</Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Missing Keywords</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((kw) => (
                    <Badge key={kw} variant="warning">{kw}</Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="views" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Recruiter View</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.recruiterView}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Hiring Manager View</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.hiringManagerView}</p></CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {VERSION_TYPES.map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    disabled={isPending}
                    onClick={() => generateVersion(type)}
                  >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {label}
                  </Button>
                ))}
              </div>
              {Object.entries(generatedVersions).map(([type, content]) => (
                <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="capitalize">{type} Version</CardTitle>
                      <CardDescription>AI-generated improved resume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{content}</pre>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
