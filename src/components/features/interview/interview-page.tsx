"use client";

import { useState, useTransition } from "react";
import { Loader2, Mic, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateInterviewAction, evaluateInterviewAction } from "@/actions/features";
import { cn, scoreBg } from "@/lib/utils";
import type { InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation } from "@/types/database";

interface Props {
  sessions: InterviewSession[];
}

export function InterviewPage({ sessions }: Props) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(sessions[0] ?? null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [practiceResponse, setPracticeResponse] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!jobTitle || !companyName) return;
    startTransition(async () => {
      const result = await generateInterviewAction({ jobTitle, companyName, jobDescription });
      if (result.success && result.data) {
        setSession(result.data as InterviewSession);
        toast.success("Interview prep generated!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEvaluate = () => {
    if (!session || !selectedQuestion || !practiceResponse) return;
    startTransition(async () => {
      const result = await evaluateInterviewAction(session.id, selectedQuestion.id, practiceResponse);
      if (result.success && result.data) {
        setEvaluation(result.data);
        toast.success("Response evaluated!");
      } else {
        toast.error(result.error);
      }
    });
  };

  const questions = (session?.questions ?? []) as InterviewQuestion[];
  const answers = (session?.answers ?? []) as InterviewAnswer[];

  return (
    <>
      <DashboardHeader title="Interview Preparation" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">AI Interview Coach</h2>
            <p className="text-muted-foreground">Practice with AI-generated questions and get STAR-format answers.</p>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Job Title</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Job Description (optional)</Label>
                <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="mt-1" rows={3} />
              </div>
              <Button variant="gradient" disabled={isPending} onClick={handleGenerate}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                Generate Interview Prep
              </Button>
            </CardContent>
          </Card>

          {session && questions.length > 0 && (
            <Tabs defaultValue="questions">
              <TabsList>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="answers">STAR Answers</TabsTrigger>
                <TabsTrigger value="practice">Mock Interview</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-3">
                {questions.map((q) => (
                  <Card key={q.id} className="cursor-pointer hover:border-violet-500/30" onClick={() => setSelectedQuestion(q)}>
                    <CardContent className="flex items-start justify-between pt-6">
                      <div>
                        <Badge variant="secondary" className="mb-2">{q.type}</Badge>
                        <p className="text-sm">{q.question}</p>
                      </div>
                      {q.difficulty && <Badge variant="outline">{q.difficulty}</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="answers" className="space-y-4">
                {answers.map((a) => {
                  const q = questions.find((q) => q.id === a.questionId);
                  return (
                    <Card key={a.questionId}>
                      <CardHeader>
                        <CardTitle className="text-base">{q?.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">STAR Answer</p>
                          <p className="text-sm">{a.starAnswer}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Best Answer</p>
                          <p className="text-sm">{a.bestAnswer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="practice" className="space-y-4">
                {selectedQuestion ? (
                  <>
                    <Card>
                      <CardHeader><CardTitle className="text-base">{selectedQuestion.question}</CardTitle></CardHeader>
                      <CardContent>
                        <Textarea
                          value={practiceResponse}
                          onChange={(e) => setPracticeResponse(e.target.value)}
                          placeholder="Type your answer here..."
                          rows={6}
                        />
                        <Button variant="gradient" className="mt-4" disabled={isPending} onClick={handleEvaluate}>
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                          Evaluate Response
                        </Button>
                      </CardContent>
                    </Card>
                    {evaluation && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Evaluation
                            <Badge className={cn(scoreBg(evaluation.confidenceScore))}>{evaluation.confidenceScore}%</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm">{evaluation.overallFeedback}</p>
                          <div>
                            <p className="text-xs font-medium">Communication Tips</p>
                            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                              {evaluation.communicationTips.map((tip, i) => <li key={i}>• {tip}</li>)}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a question from the Questions tab to practice.</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </>
  );
}
