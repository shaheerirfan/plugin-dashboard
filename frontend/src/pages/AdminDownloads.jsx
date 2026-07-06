import React, { useState, useEffect } from 'react';
import { History, Download } from 'lucide-react';

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/downloads/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDownloads(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, []);

  if (loading) return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Download Logs...</div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Download History</h2>
      
      {/* Complete Downloads Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2 text-gray-800 dark:text-white">
          <History size={20} /> <h3 className="text-lg font-bold">All Download Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
            <thead className="bg-gray-50 dark:bg-slate-900 text-xs text-gray-700 dark:text-slate-300 uppercase font-bold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {downloads.map((dl) => (
                <tr key={dl._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{dl.userEmail}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold text-xs uppercase">
                      {dl.version}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(dl.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(dl.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}