"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, Users, AlertTriangle, CheckCircle, Trash2, ShieldOff, Search, Lock, GraduationCap, FileCheck, FileX } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  
  const [activeTab, setActiveTab] = useState<"users" | "reports" | "student_verifications">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      fetchData();
      toast("Admin Access Granted", "success");
    } else {
      toast("Invalid Admin Password", "error");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this should be done via a secure backend API, not direct Supabase client (RLS bypassing needed)
      // Since we don't have RLS service keys in frontend, this might return empty if RLS blocks it.
      // Assuming RLS is configured to allow read for admin roles or similar.
      const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
      const { data: reportsData } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100);
      
      setUsers(usersData || []);
      setReports(reportsData || []);

      // Fetch pending students from Supabase
      const { data: pendingData } = await supabase
        .from('profiles')
        .select('*')
        .eq('studentVerificationStatus', 'pending');
        
      if (pendingData) {
        setPendingStudents(pendingData.map(p => ({
          id: p.device_id,
          name: p.name,
          campus: p.campus,
          id_url: p.studentIdUrl,
          isLocal: false
        })));
      }
      
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleBanUser = async (deviceId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    
    // Update user status to banned in DB
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true }) // Assuming you add this column
      .eq('device_id', deviceId);
      
    if (!error) {
      toast("User banned successfully", "success");
      fetchData(); // Refresh
    } else {
      // Local optimistic update for prototype
      setUsers(users.map(u => u.device_id === deviceId ? { ...u, is_banned: true } : u));
      toast("User banned (Optimistic update)", "success");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
        <div className="bg-dark-bg border border-glass-border p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm mb-6">Restricted access area.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
            />
            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage users and reports</p>
          </div>
        </div>
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition">
          Exit to App
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-bg border border-white/5 p-4 rounded-2xl">
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Users size={16}/> Total Users</div>
          <div className="text-3xl font-bold">{users.length || "0"}</div>
        </div>
        <div className="bg-dark-bg border border-white/5 p-4 rounded-2xl">
          <div className="text-red-400 text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Active Reports</div>
          <div className="text-3xl font-bold">{reports.length || "0"}</div>
        </div>
        <div className="bg-dark-bg border border-white/5 p-4 rounded-2xl">
          <div className="text-green-400 text-sm mb-1 flex items-center gap-2"><CheckCircle size={16}/> Verified Users</div>
          <div className="text-3xl font-bold">{users.filter(u => u.verified).length || "0"}</div>
        </div>
        <div className="bg-dark-bg border border-white/5 p-4 rounded-2xl">
          <div className="text-orange-400 text-sm mb-1 flex items-center gap-2"><ShieldOff size={16}/> Banned</div>
          <div className="text-3xl font-bold">{users.filter(u => u.is_banned).length || "0"}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-dark-bg border border-white/5 rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "users" ? "text-primary-500 border-b-2 border-primary-500" : "text-gray-400 hover:text-white"}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "reports" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
          >
            Review Reports
          </button>
          <button 
            onClick={() => setActiveTab("student_verifications")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "student_verifications" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-gray-400 hover:text-white"}`}
          >
            Student Verifications
            {pendingStudents.length > 0 && (
              <span className="ml-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingStudents.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse">Loading data from Supabase...</div>
          ) : activeTab === "users" ? (
            <div>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-1/3 bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500 text-sm"
                />
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400 border-b border-white/10 uppercase text-xs">
                    <tr>
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Device ID</th>
                      <th className="pb-3 font-semibold">Karma</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-500">No users found</td></tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={u.id || i} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                               {u.photo_url ? <img src={u.photo_url} className="w-full h-full object-cover" alt="User"/> : <div className="w-full h-full flex items-center justify-center text-xs">{u.name?.[0]}</div>}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1">
                                {u.name || "Unknown"} {u.verified && <CheckCircle size={12} className="text-blue-500" />}
                              </div>
                              <div className="text-xs text-gray-500">{u.gender || "?"}, {u.age || "?"}</div>
                            </div>
                          </td>
                          <td className="py-4 text-gray-400 font-mono text-xs">{u.device_id ? `${u.device_id.substring(0, 8)}...` : "N/A"}</td>
                          <td className="py-4 text-gray-400">{u.karma || 100}</td>
                          <td className="py-4">
                            {u.is_banned ? (
                              <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">Banned</span>
                            ) : (
                              <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Active</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleBanUser(u.device_id)}
                              disabled={u.is_banned}
                              className={`p-2 rounded-lg transition ${u.is_banned ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/20'}`}
                              title="Ban User"
                            >
                              <ShieldOff size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "reports" ? (
            <div>
              {/* Reports List */}
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No reports submitted yet.</div>
                ) : (
                  reports.map((r, i) => (
                    <div key={r.id || i} className="bg-black border border-red-500/20 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={16} className="text-red-500" />
                          <h4 className="font-bold text-white">Reason: {r.reason}</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">
                          Reporter: {r.reporter_id?.substring(0, 8)}... → Reported: {r.reported_id?.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold transition">Ban Reported User</button>
                        <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">Dismiss</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Student Verifications List */}
              <div className="space-y-4">
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No pending student verifications.</div>
                ) : (
                  pendingStudents.map((student, i) => (
                    <div key={student.id || i} className="bg-black border border-indigo-500/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4 items-center w-full md:w-auto">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                          {student.id_url ? (
                             <img src={student.id_url} alt="ID Card" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition" onClick={() => window.open(student.id_url, '_blank')} />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center"><GraduationCap size={20} className="text-gray-500"/></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-lg">{student.name}</h4>
                            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>
                          </div>
                          <p className="text-sm text-gray-400 font-medium">Campus: {student.campus || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button 
                          onClick={async () => {
                            const store = useUserStore.getState();
                            if (student.id === 'local_user' || student.isLocal) {
                                if (store.profile) {
                                    store.setProfile({ ...store.profile, studentVerificationStatus: 'verified', isStudent: true });
                                }
                            } else {
                                await supabase
                                  .from('profiles')
                                  .update({ studentVerificationStatus: 'verified', isStudent: true })
                                  .eq('device_id', student.id);
                            }
                            
                            setPendingStudents(prev => prev.filter(s => s.id !== student.id));
                            toast("Student Approved! Perks unlocked.", "success");
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                          <FileCheck size={16} /> Approve
                        </button>
                        <button 
                          onClick={async () => {
                            const store = useUserStore.getState();
                            if (student.id === 'local_user' || student.isLocal) {
                                if (store.profile) {
                                    store.setProfile({ ...store.profile, studentVerificationStatus: 'rejected', isStudent: false });
                                }
                            } else {
                                await supabase
                                  .from('profiles')
                                  .update({ studentVerificationStatus: 'rejected', isStudent: false })
                                  .eq('device_id', student.id);
                            }
                            
                            setPendingStudents(prev => prev.filter(s => s.id !== student.id));
                            toast("Student Rejected.", "error");
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition flex items-center gap-2"
                        >
                          <FileX size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
