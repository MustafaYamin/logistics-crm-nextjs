"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgRole, setOrgRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  // SMTP state
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpMessage, setSmtpMessage] = useState("");
  const [smtpLoading, setSmtpLoading] = useState(false);

  const user = session?.user as any;
  const isOwnerOrAdmin = user?.orgRole === "OWNER" || user?.orgRole === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/login"); 
    } else if (user?.orgRole === "MEMBER") {
      router.push("/");
    } else {
      fetchMembers();
    }
  }, [session, status, user, router]);

  const fetchMembers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (Array.isArray(data)) {
        setMembers(data);
    }
  };

  const fetchSmtp = async () => {
    const res = await fetch("/api/organization/smtp");
    if (res.ok) {
      const data = await res.json();
      setSmtpHost(data.smtpHost || "");
      setSmtpPort(data.smtpPort || "");
      setSmtpUser(data.smtpUser || "");
      if (data.hasPassword) setSmtpPass("********"); // mask existing password
    }
  };

  useEffect(() => {
    if (isOwnerOrAdmin) {
      fetchSmtp();
    }
  }, [isOwnerOrAdmin]);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpMessage("");
    setSmtpLoading(true);

    const payload: any = { smtpHost, smtpPort, smtpUser };
    if (smtpPass && smtpPass !== "********") {
      payload.smtpPass = smtpPass;
    }

    const res = await fetch("/api/organization/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSmtpMessage("SMTP settings saved successfully ✅");
    } else {
      const err = await res.json();
      setSmtpMessage(`Error: ${err.error || "Failed to save"}`);
    }
    setSmtpLoading(false);
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, orgRole }),
    });
    if (res.ok) {
      setMessage("Member added successfully ✅");
      setEmail("");
      setPassword("");
      setOrgRole("MEMBER");
      fetchMembers();
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) fetchMembers();
  };

  if (status === "loading") return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
            <p className="text-slate-500 mt-1">
              Organization: <span className="font-semibold text-indigo-600">{user?.orgSlug || 'Unknown'}</span>
              <span className="mx-2 text-slate-300">•</span>
              Role: <span className="font-medium text-slate-700">{user?.orgRole}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center"
            >
              Go to Freight CRM
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 font-medium rounded-lg transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </header>

        {isOwnerOrAdmin && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Invite Form */}
            <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Add New Member</h2>
              
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="colleague@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={orgRole}
                    onChange={(e) => setOrgRole(e.target.value as "ADMIN" | "MEMBER")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors mt-2"
                >
                  Add Member
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {message}
                </div>
              )}
            </div>

            {/* Members List */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Organization Members</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3">
                              {m.user?.email?.[0].toUpperCase() || '?'}
                            </div>
                            <div className="text-sm font-medium text-slate-900">{m.user?.email || 'Unknown User'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            m.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                            m.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {m.role !== 'OWNER' && m.user?.id !== user?.id && (
                            <button
                              onClick={() => handleDelete(m.userId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* SMTP Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Organization SMTP Settings</h2>
            <p className="text-slate-500 text-sm mb-5">Configure your custom SMTP server to send bulk freight emails directly from your own domain.</p>
            
            <form onSubmit={handleSaveSmtp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="smtp.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP User / Email</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="freight@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter password..."
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={smtpLoading}
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {smtpLoading ? "Saving..." : "Save SMTP Settings"}
                </button>
                
                {smtpMessage && (
                  <div className={`text-sm font-medium ${smtpMessage.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {smtpMessage}
                  </div>
                )}
              </div>
            </form>
          </div>
        </>
        )}

        {!isOwnerOrAdmin && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <h2 className="text-xl font-medium text-slate-900">Welcome to {user?.orgSlug}</h2>
            <p className="text-slate-500 mt-2">You are logged in as a member. Contact your administrator to invite others.</p>
          </div>
        )}

      </div>
    </div>
  );
}