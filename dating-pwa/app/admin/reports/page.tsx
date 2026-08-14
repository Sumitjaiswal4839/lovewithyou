"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth("/api/v1/admin/reports")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reports");
        return res.json();
      })
      .then(data => setReports(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(err => console.error("Failed to load reports", err));
  }, []);

  const handleAction = async (reportId: string, offenderId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await fetchWithAuth("/api/v1/admin/reports/resolve", {
        method: "POST",
        body: JSON.stringify({ report_id: reportId, offender_id: offenderId, action })
      });
      // Remove the resolved report from the UI
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      alert("Action failed!");
    }
  };

  return (
    <div className="p-6 bg-[#0F1014] min-h-screen text-white">
      <h1 className="text-3xl font-bold text-red-500 mb-6">Trust & Safety: Abuse Queue</h1>
      
      {!reports || reports.length === 0 ? (
        <p className="text-gray-400">No pending reports. Great job! 🎉</p>
      ) : (
        <div className="bg-[#1A1C23] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/50 text-gray-300">
                <th className="p-4 border-b border-gray-700">Date</th>
                <th className="p-4 border-b border-gray-700">Offender ID</th>
                <th className="p-4 border-b border-gray-700">Reason</th>
                <th className="p-4 border-b border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 border-b border-gray-800">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="p-4 border-b border-gray-800 font-mono text-sm">{report.offender_id.substring(0, 8)}...</td>
                  <td className="p-4 border-b border-gray-800 text-yellow-400">{report.reason}</td>
                  <td className="p-4 border-b border-gray-800 space-x-2">
                    <button 
                      onClick={() => handleAction(report.id, report.offender_id, "ban")}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-bold"
                    >
                      Ban User
                    </button>
                    <button 
                      onClick={() => handleAction(report.id, report.offender_id, "dismiss")}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
