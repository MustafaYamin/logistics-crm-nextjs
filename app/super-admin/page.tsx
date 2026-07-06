"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, LogOut, Settings } from "lucide-react";

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<any[]>([]);

  const user = session?.user as any;
  const isSuperAdmin = user?.isSuperAdmin;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/login"); 
    } else if (!isSuperAdmin) {
      router.push("/");
    } else {
      fetchOrgs();
    }
  }, [session, status, isSuperAdmin, router]);

  const fetchOrgs = async () => {
    const res = await fetch("/api/super-admin");
    if (res.ok) {
      const data = await res.json();
      setOrgs(data);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/super-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, email, password }),
    });

    if (res.ok) {
      setMessage("Organization and Admin created successfully ✅");
      setCompanyName("");
      setEmail("");
      setPassword("");
      fetchOrgs();
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
    setLoading(false);
  };

  if (status === "loading" || (!isSuperAdmin && status === "authenticated")) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
               <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Super Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage all organizations and admins</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center"
            >
              Go to Main App
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 font-medium rounded-lg transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Admin Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Provision New Admin</h2>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Org Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Acme Freight Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="admin@acme.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors mt-2 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Organization & Admin"}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Organizations List */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-fit">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">All Organizations</h2>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">Total: {orgs.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mr-3">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{org.name}</div>
                            <div className="text-xs text-slate-500">{org.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {org.adminEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {org.memberCount} / 6
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {orgs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                        No organizations created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
