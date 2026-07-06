"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Truck } from "lucide-react";

export default function BillingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <Truck className="h-16 w-16 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Subscription Required</h1>
        <p className="text-slate-400 mb-8">
          To access the full CRM and bulk email capabilities, you need an active subscription.
        </p>

        <div className="bg-white/10 rounded-xl p-6 mb-8 text-left border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-2">Pro Plan</h2>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-bold text-white">$20</span>
            <span className="text-slate-400 ml-2">/ month</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2">✓ Unlimited Agent Management</li>
            <li className="flex items-center gap-2">✓ Bulk Email Campaigns</li>
            <li className="flex items-center gap-2">✓ Custom SMTP Configurations</li>
            <li className="flex items-center gap-2">✓ Up to 5 Team Members</li>
          </ul>
        </div>

        <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors mb-4">
          Upgrade Now (Stripe)
        </button>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300 font-medium py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
