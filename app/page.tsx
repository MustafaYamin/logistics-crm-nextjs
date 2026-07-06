import Link from 'next/link';
import { Truck, Globe, Zap, Users, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Logistics CRM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Abstract background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-4xl pt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            The Modern CRM for <br className="hidden md:block" />
            <span className="text-indigo-400">Freight Forwarders</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop managing hundreds of freight agents in spreadsheets. Instantly broadcast rate requests, manage your network, and win more shipments with less effort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)]">
              Start your free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Logistics Workflows</h2>
            <p className="text-slate-400">Everything you need to manage your agent network globally.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Global Agent Directory</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Maintain a centralized database of all your partner agents, categorized by country, city, and specialized freight capabilities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Bulk Rate Requests</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Select multiple agents and instantly broadcast quotation requests with highly customizable, auto-formatted HTML emails.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Custom SMTP</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Connect your organization&apos;s own SMTP credentials. Your emails are sent directly from your own domain ensuring maximum deliverability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 mb-16 text-lg max-w-xl mx-auto">One flat rate for your entire team. No hidden fees, no per-user costs, just pure logistics power.</p>

          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-1 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-[22px] p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between text-left">
              
              <div className="mb-8 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">Everything Included</span>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold text-white">$20</span>
                  <span className="text-slate-400 font-medium">/ month</span>
                </div>
                
                <ul className="space-y-3">
                  {[
                    "Up to 5 Team Members included",
                    "Unlimited Agent Contacts",
                    "Unlimited Bulk Email Campaigns",
                    "Custom SMTP Integrations"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full md:w-auto">
                <Link href="/signup" className="block w-full text-center bg-white text-slate-950 hover:bg-slate-200 px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg">
                  Get Started Today
                </Link>
                <p className="text-center text-sm text-slate-500 mt-4">Cancel anytime.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Truck className="h-5 w-5" />
            <span className="font-bold">Logistics CRM</span>
          </div>
          <p>© {new Date().getFullYear()} Logistics CRM. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
