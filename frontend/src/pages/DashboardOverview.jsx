import React, { useState, useEffect } from 'react';

export default function DashboardOverview() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This fetches the user's data when they log in
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user data");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="p-8 w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome back, {user ? user.name : 'Loading...'}!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Plan</h3>
          {/* Displays Trial or Pro based on your Database */}
          <p className="text-2xl font-bold text-gray-800 mt-2 uppercase">
            {user ? user.plan : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Trial Ends</h3>
          <p className="text-xl font-bold text-gray-800 mt-2">
            {user ? new Date(user.trialExpires).toLocaleDateString() : '...'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Plugin Version</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">v1.0.0</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <p className="text-gray-600">No recent activity yet. Download your plugin to get started!</p>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Download Latest Version
        </button>
      </div>
    </div>
  );
}