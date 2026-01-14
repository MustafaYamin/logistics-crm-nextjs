"use client";
import { useState } from "react";
import { parseExcelFile, Agent } from "@/lib/parseExcelFile";

export default function BulkUpload() {
  const [bulkPreview, setBulkPreview] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = await parseExcelFile(file);
    console.log("Preview parsed data:", parsed);
    setBulkPreview(parsed);
  };

  // const handleImport = async () => {
  //   if (!bulkPreview.length) return;
  //   setLoading(true);

  //   try {
  //     const res = await fetch("/api/agents/bulk", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(bulkPreview),
  //     });

  //     if (res.ok) {
  //       const result = await res.json();
  //       alert(`✅ Imported ${result.count} agents successfully!`);
  //       setBulkPreview([]);
  //     } else {
  //       alert("❌ Import failed");
  //     }
  //   } catch (err) {
  //     console.error("Bulk import error:", err);
  //     alert("Error during import");
  //   } finally {
  //     setLoading(false);
  //   }
  // };




  const handleImport = async () => {
    if (!bulkPreview.length) {
      alert("❌ No data to import. Please upload a valid Excel file.");
      return;
    }
  
    // Basic validation client-side
    const validAgents = bulkPreview.filter(
      (a) => a.name && a.email && /\S+@\S+\.\S+/.test(a.email)
    );
  
    if (!validAgents.length) {
      alert("❌ The file does not contain valid agents. Please check format.");
      return;
    }
  
    setLoading(true);
    try {
      const res = await fetch("/api/agents/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validAgents),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert(
          `✅ Imported ${result.validImported} agents. Skipped ${result.skipped}.`
        );
        setBulkPreview([]);
      } else {
        alert(`❌ Import failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      alert("❌ Unexpected error during import.");
    } finally {
      setLoading(false);
    }
  };
  




  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">Bulk Upload Agents</h2>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="mb-3"
      />

      {bulkPreview.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Preview</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Company</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">City</th>
                <th className="border p-2">Country</th>
                <th className="border p-2">Specialties</th>
              </tr>
            </thead>
            <tbody>
              {bulkPreview.slice(0, 5).map((agent, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{agent.name}</td>
                  <td className="border p-2">{agent.email}</td>
                  <td className="border p-2">{agent.phone}</td>
                  <td className="border p-2">{agent.company}</td>
                  <td className="border p-2">{agent.address}</td>
                  <td className="border p-2">{agent.city}</td>
                  <td className="border p-2">{agent.country}</td>
                  <td className="border p-2">
                    {agent.specialties.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs mt-1 text-gray-500">
            Showing first 5 rows of {bulkPreview.length}
          </p>

          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Importing..." : "Import All"}
          </button>
        </div>
      )}
    </div>
  );
}
