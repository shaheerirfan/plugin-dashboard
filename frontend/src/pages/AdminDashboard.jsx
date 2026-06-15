import React, { useState, useEffect } from 'react';
import { Users, Award, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-8">Loading Admin Data...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  // Calculate statistics from our real data
  const totalUsers = users.length;
  const activeTrials = users.filter(u => u.plan === 'trial').length;
  const activePro = users.filter(u => u.plan === 'pro').length;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Admin Portal</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Registered Users</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Users size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Active Free Trials</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{activeTrials}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full text-yellow-600"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Pro Subscriptions</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{activePro}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600"><Award size={24} /></div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">User Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-bold border-b">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Plan Status</th>
                <th className="px-6 py-4">Trial Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{u.name}</td>
                  <td className="px-6 py-4">@{u.username}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      u.plan === 'pro' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.trialExpires ? new Date(u.trialExpires).toLocaleDateString() : 'N/A'}
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