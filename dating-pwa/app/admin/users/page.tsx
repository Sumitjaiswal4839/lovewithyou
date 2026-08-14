"use client";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function AdminUsersPage() {
  const [deviceId, setDeviceId] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchUser = async () => {
    if (!deviceId) return;
    setLoading(true);
    setError("");
    setUser(null);
    try {
      const data = await fetchWithAuth(`/api/v1/admin/users/${deviceId}`);
      setUser(data);
    } catch (err) {
      setError("User not found or invalid device ID");
    } finally {
      setLoading(false);
    }
  };

  const toggleVIP = async () => {
    if (!user) return;
    const newStatus = !user.is_vip;
    if (!confirm(`Are you sure you want to ${newStatus ? "GRANT" : "REVOKE"} VIP status for this user?`)) return;
    try {
      await fetchWithAuth("/api/v1/admin/users/vip", {
        method: "POST",
        body: JSON.stringify({ device_id: user.device_id, is_vip: newStatus })
      });
      setUser({ ...user, is_vip: newStatus });
      alert("VIP status updated successfully");
    } catch (err) {
      alert("Failed to update VIP status");
    }
  };

  const addCoins = async (amount: number) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to add ${amount} coins to this user?`)) return;
    try {
      await fetchWithAuth("/api/v1/admin/users/coins", {
        method: "POST",
        body: JSON.stringify({ device_id: user.device_id, amount })
      });
      setUser({ ...user, coins: user.coins + amount });
      alert("Coins updated successfully");
    } catch (err) {
      alert("Failed to update coins");
    }
  };

  return (
    <div className="p-6 bg-[#0F1014] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">User Management 🛡️</h1>

      {/* Search Bar */}
      <div className="bg-[#1A1C23] p-6 rounded-xl border border-gray-800 mb-6 flex gap-4 max-w-xl">
        <input 
          type="text" 
          value={deviceId} 
          onChange={(e) => setDeviceId(e.target.value)} 
          placeholder="Enter Device ID..."
          className="flex-1 bg-[#0F1014] p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-pink-500"
        />
        <button 
          onClick={searchUser} 
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {/* User Profile Card */}
      {user && (
        <div className="bg-[#1A1C23] p-6 rounded-xl border border-gray-800 max-w-xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={user.photo_url || "https://via.placeholder.com/100"} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-gray-700 object-cover" />
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {user.name || "Unknown User"} 
                {user.is_vip && <span title="VIP User" className="text-xl">👑</span>}
                {user.verified && <span title="Verified" className="text-blue-500 text-xl">✔️</span>}
              </h2>
              <p className="text-gray-400 text-sm font-mono">{user.device_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-[#0F1014] p-3 rounded-lg border border-gray-800">
              <p className="text-gray-500">Coins</p>
              <p className="text-xl font-bold text-yellow-500">{user.coins}</p>
            </div>
            <div className="bg-[#0F1014] p-3 rounded-lg border border-gray-800">
              <p className="text-gray-500">Karma</p>
              <p className="text-xl font-bold text-green-500">{user.karma}</p>
            </div>
            <div className="bg-[#0F1014] p-3 rounded-lg border border-gray-800">
              <p className="text-gray-500">Status</p>
              <p className={`text-lg font-bold ${user.is_banned ? 'text-red-500' : 'text-green-500'}`}>
                {user.is_banned ? "Banned" : "Active"}
              </p>
            </div>
            <div className="bg-[#0F1014] p-3 rounded-lg border border-gray-800">
              <p className="text-gray-500">VIP Access</p>
              <p className={`text-lg font-bold ${user.is_vip ? 'text-yellow-500' : 'text-gray-500'}`}>
                {user.is_vip ? "Granted" : "None"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={toggleVIP}
              className={`px-4 py-2 rounded-lg font-bold text-white transition ${user.is_vip ? 'bg-gray-600 hover:bg-gray-700' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}
            >
              {user.is_vip ? "Revoke VIP" : "Make VIP 👑"}
            </button>
            <button 
              onClick={() => addCoins(500)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition"
            >
              +500 Coins
            </button>
            <button 
              onClick={() => addCoins(1000)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition"
            >
              +1000 Coins
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
