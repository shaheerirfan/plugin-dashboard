import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Upload, Trash2, HelpCircle, List, LayoutGrid } from 'lucide-react';

export default function Downloads({ user }) {
  const isAdmin = user && user.role === 'admin';
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); 

  // Admin form state
  const [formData, setFormData] = useState({ name: '', version: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- NEW: THE CUSTOM DELETE MODAL STATES ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Holds the ID of the plugin we want to delete!

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      fetchPlugins();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchPlugins = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/downloads/plugins');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
      }
    } catch (err) {
      console.error("Failed to load plugins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pluginId, version) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('http://localhost:5000/api/downloads/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ version })
      });
      window.location.href = `http://localhost:5000/api/downloads/download/${pluginId}`;
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('pluginZip', selectedFile);
    uploadData.append('name', formData.name);
    uploadData.append('version', formData.version);
    uploadData.append('description', formData.description);

    try {
      const response = await fetch('http://localhost:5000/api/downloads/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });

      if (response.ok) {
        alert("Product uploaded successfully!");
        setFormData({ name: '', version: '', description: '' });
        setSelectedFile(null);
        document.getElementById('zipUploadInput').value = ''; 
        fetchPlugins();
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // --- UPDATED DELETE: Removed window.confirm() entirely! ---
  const handleDelete = async (pluginId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/downloads/delete/${pluginId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Product deleted successfully!");
        fetchPlugins(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changelogs = [
    {
      version: 'v1.0.0',
      date: 'June 15, 2026',
      changes: [
        'Initial beta release of SEO Plugin Pro.',
        'Fully integrated MERN user and admin accounts.',
        'Real-time automated License Key Generator.',
        'Custom interactive AI Support chatbot.',
        'Profile settings complete with local file photo uploading.'
      ]
    }
  ];

  if (loading) return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Downloads...</div>;

  if (!isLoggedIn) {
    return (
      <div className="p-8 w-full max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Product Downloads</h2>
        
        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl border border-gray-100 dark:border-slate-800 shadow-lg space-y-5 transition-colors duration-300">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Lock size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Downloads Locked</h3>
          <p className="text-gray-500 dark:text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
            To access our premium WordPress plugin files and download the latest zip builds, you must have an active account. Please log in or register below to unlock access!
          </p>
          <div className="flex gap-4 justify-center pt-2">
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition duration-200 active:scale-95 shadow-md shadow-blue-500/10">
              Log In
            </Link>
            <Link to="/signup" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-950 transition duration-200 active:scale-95 shadow-sm">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Product Downloads</h2>

      {/* ADMIN ONLY: UPLOAD ZIP CARD */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Upload className="text-blue-500" size={20} /> Register & Upload New Product
          </h3>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Product Name</label>
                <input required type="text" placeholder="e.g. SEO Plugin Pro" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white dark:border-slate-700 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Version</label>
                <input required type="text" placeholder="e.g. v1.2.0" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white dark:border-slate-700 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Description</label>
              <input required type="text" placeholder="For professional websites..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white dark:border-slate-700 outline-none" />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                id="zipUploadInput"
                required 
                type="file" 
                accept=".zip" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/40 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
              />
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shrink-0"
              >
                {uploading ? 'Uploading...' : 'Upload ZIP'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT DIRECTORY SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Product Directory</h3>
          
          <div className="flex items-center space-x-1.5 border dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-slate-800/60 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {plugins.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl border dark:border-slate-800 text-center text-gray-500 flex flex-col items-center justify-center">
            <HelpCircle className="mx-auto mb-2 text-gray-400" size={32} />
            No products uploaded yet.
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
            {plugins.map((plugin) => (
              <div 
                key={plugin._id} 
                className={`bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'flex-col text-center items-center justify-between h-[300px]' 
                    : 'flex-col md:flex-row items-center justify-between gap-6'
                }`}
              >
                <div className={`flex ${viewMode === 'grid' ? 'flex-col items-center space-y-3' : 'items-center space-x-4'}`}>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl w-fit">
                    <Download size={32} />
                  </div>
                  <div className={viewMode === 'grid' ? 'text-center' : 'text-left'}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{plugin.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                      <Calendar size={12} /> Version: {plugin.version} • Size: {plugin.fileSize}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 max-w-xs">{plugin.description}</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 justify-end ${viewMode === 'grid' ? 'w-full' : 'w-full md:w-auto'}`}>
                  <button 
                    onClick={() => handleDownload(plugin._id, plugin.version)}
                    className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download
                  </button>

                  {isAdmin && (
                    <button 
                      // --- OPEN OUR NEW CUSTOM CONFIRM MODAL ON CLICK ---
                      onClick={() => setShowDeleteConfirm(plugin._id)} 
                      className="p-3 border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* THE CHANGELOG TIMELINE CARD */}
      <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <FileText size={20} className="text-gray-400" /> Release Changelogs
        </h3>

        <div className="space-y-6">
          {changelogs.map((log, index) => (
            <div key={index} className="border-l-2 border-blue-500/30 dark:border-blue-500/20 pl-6 relative">
              <div className="absolute left-[-6px] top-1.5 w-[10px] h-[10px] bg-blue-600 rounded-full" />
              
              <div className="flex items-center space-x-3 mb-3">
                <span className="font-bold text-gray-800 dark:text-white text-base">{log.version}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500">{log.date}</span>
              </div>

              <ul className="space-y-2">
                {log.changes.map((change, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                    <span className="text-blue-500 mr-2 mt-1">▪</span> {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* --- THE CUSTOM DELETE CONFIRM MODAL (GORGEOUS, ZERO BROWSER POPUPS!) --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl border dark:border-slate-700 animate-scale-in relative overflow-hidden transition-all duration-300">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Delete Product?</h3>
            <p className="text-gray-500 dark:text-slate-300 mt-2 text-sm">
              Are you sure you want to delete this product? This will permanently remove the ZIP file from your server's disk [1]!
            </p>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-2.5 rounded-xl font-bold transition active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleDelete(showDeleteConfirm); // Run real delete
                  setShowDeleteConfirm(null);      // Close modal
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition active:scale-95 shadow-md shadow-red-500/10 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}