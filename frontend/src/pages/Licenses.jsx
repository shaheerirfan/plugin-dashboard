import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Globe, AlertCircle, Calendar } from 'lucide-react';

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  useEffect(() => {
    fetchMyLicenses();
  }, []);

  const fetchMyLicenses = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/licenses/my-licenses', {
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

  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleDeactivate = async (licenseId, domain) => {
    if (!window.confirm(`Are you sure you want to deactivate ${domain}?`)) return;
    try {
      const response = await fetch('http://localhost:5000/api/licenses/deactivate-domain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId, domain })
      });
      if (response.ok) {
        alert("Domain deactivated!");
        fetchMyLicenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Licenses...</div>;

  if (licenses.length === 0) {
    return (
      <div className="p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">My Licenses</h2>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-900/30 flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 shrink-0" size={24} />
          <div>
            <p className="text-yellow-800 dark:text-yellow-500 font-bold">You do not have any active licenses yet.</p>
            <p className="text-yellow-700 dark:text-yellow-600/80 text-sm mt-1 mb-4">Upgrade to a premium plan to generate your license key.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Licenses</h2>

      <div className="space-y-6">
        {licenses.map((lic) => {
          // --- THE CALCULATION LOGIC ---
          const expiryDate = new Date(lic.expiresAt);
          const today = new Date();
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return (
            <div key={lic._id} className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase">
                    {lic.plan} PLAN
                  </span>
                  
                  <div className="flex items-center space-x-3 mt-3">
                    <p className="font-mono font-bold text-lg text-gray-800 dark:text-white tracking-wider">{lic.key}</p>
                    <button onClick={() => handleCopy(lic.key, lic._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 transition">
                      {copiedKeyId === lic._id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Activated Websites</h4>
                  {lic.activatedSites.length === 0 ? (
                    <p className="text-xs text-gray-400">No websites activated yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {lic.activatedSites.map((site, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 p-2.5 rounded-lg border dark:border-slate-800 w-full md:w-64">
                          <span className="text-xs text-gray-700 dark:text-slate-300 flex items-center gap-2">
                            <Globe size={12} /> {site}
                          </span>
                          <button onClick={() => handleDeactivate(lic._id, site)} className="text-[10px] text-red-500 font-bold hover:underline">
                            Deactivate
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Column: Site Limit & Days Left */}
              <div className="flex flex-row md:flex-col gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 text-center flex-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase">Limit</h4>
                  <p className="text-xl font-extrabold text-gray-800 dark:text-white">
                    {lic.activatedSites.length} / {lic.siteLimit === 999 ? '∞' : (lic.siteLimit || 1)}
                  </p>
                </div>
                
                {/* --- DISPLAYING THE CALCULATED DAYS LEFT --- */}
                <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 text-center flex-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase">Days Left</h4>
                  <p className={`text-xl font-extrabold ${diffDays < 7 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                    {diffDays > 0 ? diffDays : "Expired"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}