import Link from "next/link";
import { Sparkles, ArrowRight, UserCheck, Layers, Globe, Code2, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden py-12 md:py-20">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16 md:space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developer Portfolio Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Build your professional portfolio in{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              minutes
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create, showcase, and publish your personal developer portfolio without writing deployment code or managing servers. Powered by dynamic database routing.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-90 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <span>Create Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition-colors"
            >
              <span>Login to Account</span>
            </Link>
          </div>

          {/* Dynamic URL Badge */}
          <div className="pt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-400">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Your unique URL: </span>
              <span className="font-mono text-indigo-300 font-semibold">myfolio.com/[username]</span>
            </div>
          </div>
        </div>

        {/* Feature Cards / Product Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">1. Claim Your Username</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pick a unique developer handle that represents your brand. Get an instant vanity URL accessible worldwide.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">2. Add Your Experience</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Input your tech stack, featured projects, work experience, education, and social links in one structured dashboard.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">3. Publish & Share</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Publish with a single click. Your profile is dynamically rendered from our database in real-time.
            </p>
          </div>
        </div>

        {/* Dynamic Route Demonstration Showcase */}
        <div className="glass-card rounded-2xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-left max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
                <Code2 className="w-4 h-4" /> Single Next.js Deployment Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                One App, Unlimited Portfolios
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every portfolio is rendered on-demand via database-driven dynamic routes. Explore sample usernames now:
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["rajenmandal", "rahul", "amit", "neha"].map((uname) => (
                <Link
                  key={uname}
                  href={`/${uname}`}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/50 text-slate-200 hover:text-indigo-300 font-mono text-xs sm:text-sm transition-all"
                >
                  /{uname}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
