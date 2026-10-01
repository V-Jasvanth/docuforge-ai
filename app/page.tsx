import Link from "next/link";
import { Sparkles, ArrowRight, GitBranch, FileCode, CheckCircle2, SearchCode, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-slate-50 tracking-tight">DocuForge AI</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <Button size="sm" className="space-x-1">
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 px-6 text-center max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Developer SaaS Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand, document, and maintain your codebase with AI.
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            DocuForge AI connects to your repositories, analyzes architecture, detects frameworks & database schemas, and generates production-ready developer documentation automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto space-x-2 text-sm">
                <span>Launch Developer Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com" target="_blank">
              <Button variant="outline" size="lg" className="w-full sm:w-auto space-x-2 text-sm border-slate-700">
                <GitBranch className="h-4 w-4" />
                <span>Connect GitHub Repository</span>
              </Button>
            </Link>
          </div>

          {/* Architecture Teaser Card */}
          <div className="mt-16 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur text-left max-w-3xl mx-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" /> docuforge-pipeline.ts
              </span>
              <span className="text-slate-500">Provider-Independent AI Architecture</span>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg border border-slate-800/80 leading-relaxed">
{`// 1. Scan Repository & Exclude Build Artifacts
const analysis = await codebaseAnalyzer.analyze("V-Jasvanth/Flowboard-Saas");

// 2. Synthesize Framework, Route Handlers & Prisma Models
// 3. Generate Sectioned Technical Documentation via Replaceable AI Service
const docs = await aiService.generateDocumentation(analysis);`}
            </pre>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800/60 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <SearchCode className="h-8 w-8 text-brand-400" />
              <h3 className="text-lg font-bold text-white">Smart Repository Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter node_modules, build directories, and binaries. Detect frameworks, dependencies, API endpoints, and database models cleanly.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <Sparkles className="h-8 w-8 text-brand-400" />
              <h3 className="text-lg font-bold text-white">Provider-Independent AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built on a flexible AI abstraction layer. Switch between OpenAI, Anthropic, or custom models without vendor lock-in.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <ShieldCheck className="h-8 w-8 text-brand-400" />
              <h3 className="text-lg font-bold text-white">Documentation Drift Guard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track codebase modifications and identify outdated sections automatically so your documentation never loses sync with your code.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>DocuForge AI © {new Date().getFullYear()} — Software Codebase Documentation SaaS</p>
      </footer>
    </div>
  );
}
