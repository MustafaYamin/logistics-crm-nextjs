'use client';

// Root client-side page that renders the app shell and a 3-step tabbed workflow.
// Tabs: 1) Select Agents, 2) Manage Agents, 3) Email Status/Confirmation.

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentSelection } from '@/components/agent-selection';
import AgentManagement from '@/components/agent-management';
import EmailConfirmation from '@/components/email-confirmation';
import { Truck, Users, Mail, LogOut } from 'lucide-react';
import { signOut } from "next-auth/react";


export default function Home() {
  // Controls which step/tab is visible. Values: 'selection' | 'management' | 'confirmation'
  const [activeTab, setActiveTab] = useState('selection');
  // Store selected agents from AgentSelection to pass to EmailConfirmation
  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* App header: title, subtitle, sign out button */}
        <div className="relative mb-8">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Acumen Freight Solutions</h1>
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