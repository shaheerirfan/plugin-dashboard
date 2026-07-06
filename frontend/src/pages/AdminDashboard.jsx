import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react'; // We only need the Trash icon now!

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errData = await response.json();
        setError(errData.message || "Access Denied");
      }
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePlanChange = async (userId, plan) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/update-plan', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, plan })
      });
      if (response.ok) {
        alert("Plan updated successfully!");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("User deleted successfully.");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Admin Data...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Admin Portal</h2>

      {/* User Directory Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">User Directory</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Manage plans, edit user roles, or delete registered accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
            <thead className="bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-slate-300 uppercase font-bold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Plan</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                    {u.name} <span className="text-xs text-gray-400 dark:text-slate-500 font-normal">@{u.username}</span>
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  
                  <td className="px-6 py-4">
                    <select 
                      value={u.plan} 
                      onChange={(e) => handlePlanChange(u._id, e.target.value)}
                      className="p-1 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-xs font-bold uppercase text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="trial">Trial</option>
                      <option value="essential">Essential</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    {u.trialExpires ? new Date(u.trialExpires).toLocaleDateString() : 'N/A'}
                  </td>

                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-2 border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}