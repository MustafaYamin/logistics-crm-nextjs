'use client';
import * as XLSX from "xlsx";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Mail, Users, Upload, Download } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  specialties?: string[] | null;
}

const specialtyOptions = [
  'Refrigerated', 'Oversized', 'Dry Van', 'LTL', 'Flatbed', 'Heavy Haul', 'Air', 'Sea', 'Ground', 'Rail'
];

const countries = [
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'China', 'Japan', 'South Korea', 'India', 'Australia', 'Brazil', 'Argentina', 'Chile'
];

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<Partial<Agent>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: ''
  });

  // helper: reload agents
  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load agents error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleAddAgent = () => {
    setIsEditing(false);
    setSelectedAgent(null);
    setFormData({ name: '', email: '', phone: '', company: '', address: '', city: '', country: '' });
    setIsDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? '',
      company: agent.company ?? '',
      address: agent.address ?? '',
      city: agent.city ?? '',
      country: agent.country ?? '',
      specialties: agent.specialties ?? []
    });
    setSelectedAgent(agent);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Delete this agent?')) return;
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      // refresh
      await loadAgents();
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete agent');
    }
  };

  const handleSaveAgent = async () => {
    // Basic client-side validation
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      setIsProcessing(true);
      if (isEditing && selectedAgent) {
        // PUT /api/agents/:id
        const res = await fetch(`/api/agents/${selectedAgent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Update failed');
        }
      } else {
        // POST /api/agents
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Create failed');
        }
      }
      // refresh list
      await loadAgents();
      setIsDialogOpen(false);
      setIsEditing(false);
      setSelectedAgent(null);
      setFormData({ name: '', email: '', phone: '', company: '', address: '', city: '', country: '' });
    } catch (err) {
      console.error('Save agent error', err);
      alert('Failed to save agent');
    } finally {
      setIsProcessing(false);
    }
  };

  // specialties helper (optional if you later add JSON field)
  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => {
      const prevSpecs = (prev?.specialties as string[] | undefined) ?? [];
      return {
        ...prev,
        specialties: prevSpecs.includes(specialty)
          ? prevSpecs.filter(s => s !== specialty)
          : [...prevSpecs, specialty]
      };
    });
  };

  const handleBulkFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    parseExcelFile(file);
  };

const parseExcelFile = (file: File) => {
  setIsProcessing(true);
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Read first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      // Map rows to Agent fields
      const parsed: Partial<Agent>[] = rows.map((row) => ({
        name: row["Name"] || "",
        email: row["Email"] || "",
        phone: row["Phone"] || "",
        company: row["Company"] || "",
        address: row["Address"] || "",
        city: row["City"] || "",
        country: row["Country"] || "",
        specialties: row["Specialties (comma separated)"]
          ? String(row["Specialties (comma separated)"])
              .split(",")
              .map((s) => s.trim())
          : [],
      }));

      setBulkPreview(parsed);
    } catch (err) {
      console.error("Parse error", err);
      alert("Failed to parse bulk file");
    } finally {
      setIsProcessing(false);
    }
  };

  reader.readAsArrayBuffer(file);
};

  const handleBulkImport = async () => {
    if (bulkPreview.length === 0) return;
    setIsProcessing(true);
    try {
      for (const ag of bulkPreview) {
        const payload = {
          name: ag.name,
          email: ag.email,
          phone: ag.phone ?? '',
          company: ag.company ?? '',
          address: ag.address ?? '',
          city: ag.city ?? '',
          country: ag.country ?? '',
          specialties: ag.specialties ?? []
        };
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn('Bulk item failed', err);
          // continue with others
        }
      }
      await loadAgents();
      setBulkFile(null);
      setBulkPreview([]);
      setIsBulkDialogOpen(false);
    } catch (err) {
      console.error('Bulk import error', err);
      alert('Bulk import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
  const csvContent = [
    [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Address",
      "City",
      "Country",
      
    ],
    [
      "John Doe",
      "john@example.com",
      "1234567890",
      "Global Freight Solutions",
      "123 Main St",
      "Karachi",
      "Pakistan",
      
    ],
    [
      "Jane Smith",
      "jane@example.com",
      "9876543210",
      "Acumen Logistics",
      "456 Park Ave",
      "Lahore",
      "Pakistan",
      
    ],
  ]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agents_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-gray-600">Manage your freight agent network and locations</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddAgent} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
                <DialogDescription>{isEditing ? 'Update agent' : 'Add a new freight agent'}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input id="name" value={formData.name ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Agent full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="agent@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={formData.company ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} placeholder="Company name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country ?? ''} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} placeholder="City" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address ?? ''} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Address" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveAgent} disabled={isProcessing}>{isProcessing ? 'Saving...' : (isEditing ? 'Update Agent' : 'Add Agent')}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Add Agents in Bulk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Agents</DialogTitle>
                <DialogDescription>Upload a CSV or Excel file to import agents</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bulk-file">File</Label>
                    <p className="text-sm text-gray-600 mt-1">Supported: .csv, .xlsx (CSV recommended for now)</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4" /> Download Template</Button>
                </div>

                <Input id="bulk-file" type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFileUpload} />

                {bulkPreview.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Preview ({bulkPreview.length})</h4>
                    <div className="max-h-52 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agent</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Country</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkPreview.map((b, i) => (
                            <TableRow key={i}>
                              <TableCell>{b.name}</TableCell>
                              <TableCell>{b.email}</TableCell>
                              <TableCell>{b.company}</TableCell>
                              <TableCell>{b.country}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleBulkImport} disabled={isProcessing || bulkPreview.length === 0}>{isProcessing ? 'Importing...' : `Import ${bulkPreview.length} Agents`}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-gray-600">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Directory</CardTitle>
          <CardDescription>Manage your freight agent network</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company/Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{agent.company}</p>
                        <p className="text-sm text-gray-600">{agent.name}</p>
                        {/* <p className="text-xs text-gray-500">ID: {agent.id}</p> */}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" /> {agent.email}
                        </div>
                        {agent.phone && <div className="text-sm">{agent.phone}</div>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{agent.country ?? agent.city ?? '—'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(agent.specialties && agent.specialties.length > 0) ? agent.specialties.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>) : <Badge variant="outline" className="text-xs">No specialties</Badge>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditAgent(agent)} className="h-8 w-8 p-0"><Edit className="h-3 w-3" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
