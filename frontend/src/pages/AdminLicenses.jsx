import React, { useState, useEffect } from 'react';
import { Key, Plus, Ban, CheckCircle } from 'lucide-react';

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ userEmail: '', plan: 'essential', siteLimit: 1 });

  // Fetch all license keys when page loads
  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/licenses/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLicenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate a new key
  const handleGenerate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/licenses/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("License generated successfully!");
        setFormData({ userEmail: '', plan: 'essential', siteLimit: 1 });
        fetchLicenses(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Block or Activate a key
  const handleToggleStatus = async (licenseId, currentStatus) => {
    try {
      const response = await fetch('http://localhost:5000/api/licenses/toggle-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId, currentStatus })
      });
      if (response.ok) {
        fetchLicenses(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading Licenses...</div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. LEFT COLUMN: GENERATE KEY FORM */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" /> Generate New Key
        </h3>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">User Email</label>
            <input required type="email" placeholder="customer@example.com" value={formData.userEmail} onChange={(e) => setFormData({...formData, userEmail: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Plan</label>
            <select value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white outline-none">
              <option value="essential">Essential</option>
              <option value="advanced_solo">Advanced Solo</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Site Limit</label>
            <select value={formData.siteLimit} onChange={(e) => setFormData({...formData, siteLimit: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white outline-none">
              <option value="1">1 Site</option>
              <option value="3">3 Sites</option>
              <option value="999">Unlimited (999)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition">
            Generate Key
          </button>
        </form>
      </div>

      {/* 2. RIGHT COLUMN: ALL LICENSES TABLE */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Key size={20} className="text-blue-600" /> Active License Keys
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-bold border-b">
              <tr>
                <th className="px-6 py-4">License Key</th>
                <th className="px-6 py-4">Owner Email</th>
                <th className="px-6 py-4">Sites Used</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licenses.map((lic) => (
                <tr key={lic._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">{lic.key}</td>
                  <td className="px-6 py-4 text-xs">{lic.userEmail}</td>
                  <td className="px-6 py-4 text-xs">
                    {lic.activatedSites.length} / {lic.siteLimit === 999 ? '∞' : lic.siteLimit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      lic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(lic._id, lic.status)}
                      className={`p-1.5 rounded-lg border transition ${
                        lic.status === 'active' 
                          ? 'border-red-200 hover:bg-red-50 text-red-600' 
                          : 'border-green-200 hover:bg-green-50 text-green-600'
                      }`}
                    >
                      {lic.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
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