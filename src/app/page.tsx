"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, FileText, Network, Briefcase, Mail, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { MarketingFooter } from "@/components/layout/marketing-footer";

const features = [
  { icon: FileText, title: "Resume Optimizer", description: "ATS scoring, keyword analysis, and AI-generated improved versions." },
  { icon: Network, title: "LinkedIn Review", description: "Profile optimization with headline rewrites and networking strategies." },
  { icon: Target, title: "Portfolio Review", description: "GitHub and portfolio analysis for code quality, UX, and presentation." },
  { icon: Briefcase, title: "Job Matching", description: "AI-powered job search with match scores and learning paths." },
  { icon: Mail, title: "Cover Letters", description: "Personalized cover letters in multiple tones and lengths." },
  { icon: MessageSquare, title: "Interview Prep", description: "Mock interviews, STAR answers, and confidence scoring." },
];

const steps = [
  { step: "01", title: "Upload Resume", description: "Upload your PDF, DOCX, or TXT resume for instant AI analysis." },
  { step: "02", title: "Get Optimized", description: "Receive ATS scores, improvements, and multiple resume versions." },
  { step: "03", title: "Match & Apply", description: "Find matching jobs, generate cover letters, and track applications." },
  { step: "04", title: "Ace Interviews", description: "Practice with AI-generated questions and get real-time feedback." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer", quote: "My ATS score went from 62 to 91. Got 3 interviews in the first week." },
  { name: "Marcus Johnson", role: "Product Manager", quote: "The cover letter generator saved me hours. Every letter felt genuinely personal." },
  { name: "Priya Patel", role: "Data Scientist", quote: "Interview prep with STAR answers gave me the confidence I needed. Landed my dream role." },
];

const faqs = [
  { q: "How does the resume optimizer work?", a: "Upload your resume and our AI analyzes ATS compatibility, keywords, grammar, formatting, and achievements. You get actionable suggestions and improved versions." },
  { q: "What job boards do you search?", a: "We scrape LinkedIn Jobs, Indeed, RemoteOK, Wellfound, and company career pages using Firecrawl for comprehensive coverage." },
  { q: "Is my data secure?", a: "Yes. We use Clerk for authentication, Supabase with row-level security, and never share your data with third parties." },
  { q: "Can I cancel anytime?", a: "Absolutely. Pro subscriptions can be canceled at any time with no penalties." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 gradient-bg">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-6">
              ✨ AI-Powered Career Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Stop Applying Blindly.{" "}
              <span className="gradient-text">Let AI Get You Hired.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Upload your resume, optimize it, match jobs, generate cover letters, and ace interviews — all powered by AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gradient" size="lg" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required · 3 free resume reviews</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need to Land Your Dream Job</h2>
            <p className="mt-4 text-muted-foreground">Six powerful AI tools working together as your career copilot.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <feature.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Four steps from resume to offer letter.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Loved by Job Seekers</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="glass">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li>✓ 3 Resume Reviews</li>
                  <li>✓ 5 Job Matches</li>
                  <li>✓ Basic AI Chat</li>
                  <li>✓ 1 Cover Letter</li>
                </ul>
                <Button variant="outline" className="mt-6 w-full" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-violet-500/50 shadow-lg shadow-violet-500/10">
              <CardHeader>
                <Badge className="w-fit">Most Popular</Badge>
                <CardTitle className="mt-2">Pro</CardTitle>
                <CardDescription>For serious job seekers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li>✓ Unlimited Resume Reviews</li>
                  <li>✓ Advanced Job Matching</li>
                  <li>✓ Unlimited Cover Letters</li>
                  <li>✓ Interview Coach</li>
                  <li>✓ Priority AI</li>
                </ul>
                <Button variant="gradient" className="mt-6 w-full" asChild>
                  <Link href="/sign-up">Start Pro Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{faq.a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-8 sm:p-12">
            <h2 className="text-3xl font-bold">Ready to Land Your Dream Job?</h2>
            <p className="mt-4 text-muted-foreground">Join thousands of job seekers using AI to accelerate their careers.</p>
            <Button variant="gradient" size="lg" className="mt-8" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
