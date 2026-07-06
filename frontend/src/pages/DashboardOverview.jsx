import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Imported Link for onboarding navigation!
import { Users, Award, Clock, Key, Download, PartyPopper, CheckCircle2, Trash2 } from 'lucide-react'; // Restored Trash2!

export default function DashboardOverview({ user }) { 
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false); 

  // Admin-specific states
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLicenses, setAdminLicenses] = useState([]);
  const [adminDownloads, setAdminDownloads] = useState([]); 
  
  // --- REAL-TIME GRAPH & TIMEFRAME STATES ---
  const [trackerType, setTrackerType] = useState('signups'); 
  const [timeframe, setTimeframe] = useState('monthly');     
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [graphLabels, setGraphLabels] = useState(["Jan", "Feb", "Mar", "Apr", "May"]);
  const [graphData, setGraphData] = useState([0, 0, 0, 0, 0]);
  const [animateGraph, setAnimateGraph] = useState(false);

  // Fetches graph data dynamically based on TrackerType, Timeframe, and SelectedMonth!
  const fetchGraphData = async (type, tf, month) => {
    const token = localStorage.getItem('token');
    setAnimateGraph(false); // Reset animation so columns slide up beautifully again!
    try {
      const endpoint = type === 'signups' 
        ? `http://localhost:5000/api/auth/admin/stats/signups?timeframe=${tf}&month=${month}`
        : `http://localhost:5000/api/downloads/admin/stats/downloads?timeframe=${tf}&month=${month}`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGraphLabels(data.labels);
        setGraphData(data.counts);
        setTimeout(() => setAnimateGraph(true), 250); // Trigger slide-up animation
      }
    } catch (err) {
      console.error("Failed to load graph stats:", err);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setLoadingAdmin(false);
      return;
    }

    try {
      // --- STRIPE SUCCESS REDIRECT VERIFICATION ---
      const queryParams = new URLSearchParams(window.location.search);
      const sessionId = queryParams.get('session_id');

      if (sessionId) {
        const verifyRes = await fetch('http://localhost:5000/api/payments/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        
        if (verifyRes.ok) {
          localStorage.setItem('showWelcomeModal', 'true'); 
          window.location.href = '/'; 
          return;
        }
      }

      // Load general admin metrics if logged-in user is Admin
      if (user.role === 'admin') {
        const usersRes = await fetch('http://localhost:5000/api/auth/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const licensesRes = await fetch('http://localhost:5000/api/licenses/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const downloadsRes = await fetch('http://localhost:5000/api/downloads/all', { 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersRes.ok && licensesRes.ok && downloadsRes.ok) {
          const uData = await usersRes.json();
          const lData = await licensesRes.json();
          const dData = await downloadsRes.json();
          setAdminUsers(uData);
          setAdminLicenses(lData);
          setAdminDownloads(dData);
          
          // Fetch initial signups graph data
          await fetchGraphData(trackerType, timeframe, selectedMonth);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const showModalFlag = localStorage.getItem('showWelcomeModal');
    if (showModalFlag === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('showWelcomeModal'); 
    }
  }, [user]); // Re-runs automatically when App.jsx loads your user profile!

  // Refetches graph data dynamically whenever you toggle EITHER dropdown!
  useEffect(() => {
    if (user && user.role === 'admin' && !loadingAdmin) {
      fetchGraphData(trackerType, timeframe, selectedMonth);
    }
  }, [trackerType, timeframe, selectedMonth]);

  // Auto-reset month filter if user switches back to "Monthly" view mode
  useEffect(() => {
    if (timeframe === 'monthly') {
      setSelectedMonth('all');
    }
  }, [timeframe]);

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

  if (!user) {
    return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Dashboard...</div>;
  }

  // ========================================================
  // 👑 SCENARIO A: RENDERS ADMIN COMMAND CENTER (For Admins)
  // ========================================================
  if (user.role === 'admin') {
    if (loadingAdmin) {
      return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading Admin Cockpit...</div>;
    }

    const totalUsers = adminUsers.length;
    const activeLicenses = adminLicenses.filter(l => l.status === 'active').length;
    const totalSitesActivated = adminLicenses.reduce((sum, lic) => sum + (lic.activatedSites ? lic.activatedSites.length : 0), 0);
    const totalDownloads = adminDownloads.length;

    // Real-Time Graph Calculations (finds max value for dynamic scaling)
    const maxVal = Math.max(...graphData, 1);

    // Get current month name to display in heading
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const headingTitle = selectedMonth === 'all' 
      ? `${timeframe} ${trackerType}` 
      : `${monthNames[parseInt(selectedMonth)]} ${trackerType} (Weekly)`;

    return (
      <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in relative">
        
        {/* CSS Animation */}
        
        <style dangerouslySetInnerHTML={
          {__html: `
          @keyframes scaleIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}
        
        } />

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
          Business Command Center
        </h2>

        {/* Real-Time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div>
              <h3 className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-2">{totalUsers}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={20} /></div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div>
              <h3 className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Keys</h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-2">{activeLicenses}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/40 p-3 rounded-full text-yellow-600 dark:text-yellow-400"><Key size={20} /></div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div>
              <h3 className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Sites Active</h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-2">{totalSitesActivated}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/40 p-3 rounded-full text-green-600 dark:text-green-400"><Award size={20} /></div>
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div>
              <h3 className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Downloads</h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-2">{totalDownloads}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-full text-purple-600 dark:text-purple-400"><Download size={20} /></div>
          </div>
        </div>

        {/* Real-Time Graph & Recent Downloads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Real-Time Graph */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            
            {/* GRAPH HEADER WITH DATA, TIMEFRAME, & MONTH SELECTORS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                {headingTitle}
              </h3>
              
              <div className="flex items-center space-x-2">
                {/* 1. DATA TYPE SELECTOR */}
                <select 
                  value={trackerType}
                  onChange={(e) => setTrackerType(e.target.value)}
                  className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="signups">User Signups</option>
                  <option value="downloads">Plugin Downloads</option>
                </select>

                {/* 2. TIMEFRAME SELECTOR */}
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>

                {/* 3. SPECIFIC MONTH FILTER (Only visible when weekly timeframe is selected!) */}
                {timeframe === 'weekly' && (
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-fade-in"
                  >
                    <option value="all">Rolling Weeks</option>
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                  </select>
                )}
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-6 pt-6 border-b border-gray-100 dark:border-slate-700">
              {graphLabels.map((label, idx) => {
                const count = graphData[idx] || 0;
                const heightPercentage = Math.round((count / maxVal) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group relative">
                    {/* Hover tooltip showing actual number */}
                    <div className="absolute top-[-30px] bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none font-bold">
                      {count} {trackerType}
                    </div>

                    <div className="w-full bg-blue-500/10 dark:bg-blue-950/20 rounded-t-lg h-48 flex items-end">
                      <div 
                        className="w-full bg-blue-600 dark:bg-blue-500 rounded-t-lg transition-all duration-1000 ease-out shadow-lg shadow-blue-500/10" 
                        style={{ height: animateGraph ? `${heightPercentage}%` : '0%' }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-400 mt-2">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT DOWNLOADS LOG TABLE */}
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Recent Downloads</h3>
            
            {adminDownloads.length === 0 ? (
              <p className="text-xs text-gray-400 py-12 text-center">No downloads logged yet.</p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
                {adminDownloads.slice(0, 4).map((dl) => (
                  <div key={dl._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-800">
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{dl.userEmail}</p>
                      <p className="text-[10px] text-gray-400">{new Date(dl.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      {dl.version}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* --- WELCOME POPUP FOR ADMINS --- */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border dark:border-slate-700 animate-scale-in relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/4 left-1/4 animate-ping" />
                <div className="absolute w-2 h-2 bg-pink-500 rounded-full top-1/3 right-1/4 animate-bounce" />
                <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full top-1/2 left-1/3 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="absolute w-2 h-2 bg-green-500 rounded-full top-2/3 right-1/3 animate-ping" style={{ animationDelay: '0.4s' }} />
              </div>

              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1.5s_infinite]">
                <PartyPopper className="text-blue-600 dark:text-blue-400" size={36} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}!</h3>
              <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
                Accessing your main developer control panel. Keep up the great work!
              </p>
              
              <button onClick={() => setShowWelcome(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/15">
                Enter Portal
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // 👤 SCENARIO B: RENDERS CLIENT ONBOARDING
  // ==========================================
  return (
    <div className="p-8 w-full max-w-5xl mx-auto relative space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 tracking-tight transition-colors duration-300">
        Welcome back, {user.name}
      </h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* CARD 1: Active Plan */}
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />
          <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Active Plan</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white mt-2 uppercase transition-colors duration-300">
            {user.plan}
          </p>
        </div>
        
        {/* CARD 2: Trial Ends */}
        <div className="bg-white p-5 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500" />
          <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Trial Ends</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">
            {user.trialExpires ? new Date(user.trialExpires).toLocaleDateString() : '...'}
          </p>
        </div>

        {/* CARD 3: Version */}
        <div className="bg-white p-5 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gray-400" />
          <h3 className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Plugin Version</h3>
          <p className="text-lg font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">
            v1.0.0
          </p>
        </div>
      </div>

      {/* --- INTERACTIVE ONBOARDING QUICK START GUIDE (For Users - ESCAPED WORKAROUND!) --- */}
      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="text-blue-500 animate-pulse" size={20} /> Quick Start Guide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 - UPDATED PATH TO POINT TO THE NEW /plugin PATH! */}
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border dark:border-slate-800 flex items-start space-x-3">
            <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full shrink-0">1</span>
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Download ZIP</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">Download your stable ZIP file from your downloads dashboard.</p>
              <Link to="/plugin" className="text-xs text-blue-500 font-bold hover:underline mt-2 inline-block">Go to Plugin →</Link>
            </div>
          </div>
          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border dark:border-slate-800 flex items-start space-x-3">
            <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full shrink-0">2</span>
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Copy License Key</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">Copy your secure premium license key to unlock advanced SEO features.</p>
              <Link to="/licenses" className="text-xs text-blue-500 font-bold hover:underline mt-2 inline-block">Go to Licenses →</Link>
            </div>
          </div>
          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border dark:border-slate-800 flex items-start space-x-3">
            <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full shrink-0">3</span>
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Activate on WordPress</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                Go to WordPress Plugins → Add New → Upload, select ZIP, and paste your key!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Recent Activity</h3>
        <p className="text-gray-500 dark:text-slate-300 text-sm leading-relaxed transition-colors duration-300">
          No recent activity yet. Download your plugin to get started!
        </p>
        <button className="mt-5 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm">
          Download Latest Version
        </button>
      </div>

      {/* --- THE WELCOME / PARTY POPPER POPUP MODAL (For normal users) --- */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border dark:border-slate-700 animate-scale-in relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/4 left-1/4 animate-ping" />
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full top-1/3 right-1/4 animate-bounce" />
              <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full top-1/2 left-1/3 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute w-2 h-2 bg-green-500 rounded-full top-2/3 right-1/3 animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>

            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1.5s_infinite]">
              <PartyPopper className="text-blue-600 dark:text-blue-400" size={36} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name}!</h3>
            <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
              Thank you for choosing SEO Plugin Pro. Your 30-day free trial has been successfully activated and is ready to go!
            </p>
            
            <button onClick={() => setShowWelcome(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/15">
              Let's Get Started!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}