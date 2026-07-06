'use client';

// Root client-side page that renders the app shell and a 3-step tabbed workflow.
// Tabs: 1) Select Agents, 2) Manage Agents, 3) Email Status/Confirmation.

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentSelection } from '@/components/agent-selection';
import AgentManagement from '@/components/agent-management';
import EmailConfirmation from '@/components/email-confirmation';
import { Truck, Users, Mail, LogOut, Settings } from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Home() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isSuperAdmin = user?.isSuperAdmin;
  const isMember = user?.orgRole === 'MEMBER';
  const isPaid = user?.isPaid;
  
  // Controls which step/tab is visible. Values: 'selection' | 'management' | 'confirmation'
  const [activeTab, setActiveTab] = useState('selection');
  // Store selected agents from AgentSelection to pass to EmailConfirmation
  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/login");
    } else if (!isPaid && !isSuperAdmin) {
      router.push("/billing");
    }
  }, [session, status, isPaid, isSuperAdmin, router]);
 
  if (status === "loading" || (!isPaid && !isSuperAdmin && status === "authenticated")) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* App header: title, subtitle, sign out button */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 flex items-center gap-3">
            {isSuperAdmin && (
              <Link
                href="/super-admin"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-lg transition-colors shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Super Admin
              </Link>
            )}
            {!isMember && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
          
          <div className="text-center pt-8 md:pt-0">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Welcome, {session?.user?.email ? session.user.email.split('@')[0] : 'User'}!</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your freight operations with bulk query management and agent coordination
            </p>
          </div>
        </div>

        {/* Main content: a Card containing the tabbed workflow */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            {/* Tabs are controlled by activeTab; each TabsContent hosts one step */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-white rounded-t-lg">
                {/* Tab triggers (navigation) */}
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-16">
                  <TabsTrigger 
                    value="selection" 
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    <Users className="h-4 w-4" />
                    Select Agents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="management"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    <Truck className="h-4 w-4" />
                    Manage Agents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="confirmation"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    <Mail className="h-4 w-4" />
                    Email Status
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-gray-50 p-6">
                {/* Step 1: Agent filtering + selection */}
                <TabsContent value="selection" className="mt-0">
                  <AgentSelection onSelectionChange={setSelectedAgents} />
                </TabsContent>
                
                {/* Step 2: Manage agents (CRUD, metadata, etc.) */}
                <TabsContent value="management" className="mt-0">
                  <AgentManagement />
                </TabsContent>
                
                {/* Step 3: Compose/send emails and track status */}
                <TabsContent value="confirmation" className="mt-0">
                  <EmailConfirmation recipients={selectedAgents} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}