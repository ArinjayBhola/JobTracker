import { db } from "@/db";
import { getEntries } from "@/actions/job-tracker";
import { JobTrackerClient } from "@/components/job-tracker-client";
import { auth } from "@/auth";
import Link from "next/link";
import { Briefcase, CheckCircle2, Zap, BarChart3, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // If database is not configured, show setup message
  if (!db) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 glass-card rounded-2xl">
            <h1 className="text-3xl font-bold mb-4 tracking-tight">System Check</h1>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-yellow-600 mb-2">Database Not Configured</h2>
              <p className="text-muted-foreground mb-4 text-sm">Please set up your database to get started:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a PostgreSQL database</li>
                <li>Set <code className="bg-muted px-1 rounded text-foreground">DATABASE_URL</code></li>
                <li>Run <code className="bg-muted px-1 rounded text-foreground">npm run db:push</code></li>
                <li>Restart server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-20 pb-20 sm:pt-32 sm:pb-32 lg:pb-40">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-40 dark:opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 text-center">
              <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-8 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
                v2.0 Now Available
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl mb-6 animate-slide-up stagger-1">
                Land your dream job <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 animate-gradient-text">
                  with precision.
                </span>
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground animate-slide-up stagger-2 leading-relaxed">
                Stop using spreadsheets. Track applications, organize outreach, and master your job hunt with a tool built for modern professionals.
              </p>
              
              <div className="mt-10 flex justify-center gap-4 animate-slide-up stagger-3">
                <Link href="/login">
                  <ShinyButton className="h-12 px-8 text-base">
                    Get Started Free <ArrowRight className="inline-block ml-2 h-4 w-4" />
                  </ShinyButton>
                </Link>
                <Link 
                  href="https://github.com/ArinjayBhola/JobHunter" 
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-foreground ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  View on GitHub
                </Link>
              </div>
            </div>
          </section>

          {/* Features Grid (Bento Style) */}
          <section className="py-20 bg-muted/30 border-y border-border/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to succeed</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Built to replace your messy Excel sheets and disparate notes with a unified, powerful dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-indigo-500/20 transition-colors hover:shadow-lg dark:hover:shadow-indigo-500/5 duration-300 p-8 flex flex-col">
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Visual Pipeline</h3>
                  <p className="text-muted-foreground flex-1">
                    See exactly where you stand. Kanban boards and status trackers keep your momentum going visibly.
                  </p>
                  <div className="mt-6 h-32 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/20 overflow-hidden relative">
                     <div className="absolute inset-x-4 top-4 h-2 bg-blue-500/20 rounded-full w-3/4"></div>
                     <div className="absolute inset-x-4 top-8 h-2 bg-blue-500/20 rounded-full w-1/2"></div>
                     {/* Decorative UI elements */}
                  </div>
                </div>

                {/* Feature 2 (Span 2 cols) */}
                <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 z-10">
                    <div className="mb-4 h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Automated Follow-ups</h3>
                    <p className="text-indigo-100/90 text-lg">
                      Never drop the ball. Intelligent smart reminders tell you exactly when to reach out to recruiters and hiring managers.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 h-48 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 p-4 transform md:rotate-3 transition-transform duration-500 group-hover:rotate-0">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-400"></div>
                        <div className="h-2 w-24 bg-white/40 rounded-full"></div>
                     </div>
                     <div className="space-y-2">
                        <div className="h-2 w-full bg-white/20 rounded-full"></div>
                        <div className="h-2 w-5/6 bg-white/20 rounded-full"></div>
                        <div className="h-2 w-4/6 bg-white/20 rounded-full"></div>
                     </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-emerald-500/20 transition-colors hover:shadow-lg dark:hover:shadow-emerald-500/5 duration-300 p-8 flex flex-col">
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
                  <p className="text-muted-foreground flex-1">
                    Track your conversion rates. Understand which resume versions and outreach templates are working best.
                  </p>
                </div>

                 {/* Feature 4 */}
                 <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-violet-500/20 transition-colors hover:shadow-lg dark:hover:shadow-violet-500/5 duration-300 p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                       <div className="mb-4 h-12 w-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Centralized Job Hub</h3>
                      <p className="text-muted-foreground">
                        Keep everything in one place. URLs, notes, contacts, and interview dates. No more searching through email threads.
                      </p>
                    </div>
                    
                  </div>
                </div>
                
                 {/* Feature 5 */}
                 <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 p-8 flex items-center justify-center text-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">100+</h3>
                      <p className="text-sm opacity-80">Applications Tracked</p>
                    </div>
                 </div>

              </div>
            </div>
          </section>
        </main>
        
        <footer className="py-8 border-t border-border/50 text-center text-sm text-muted-foreground bg-muted/10">
          <p>© {new Date().getFullYear()} Job Tracker. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  const entries = await getEntries("all");

  return <JobTrackerClient initialEntries={entries} />;
}
