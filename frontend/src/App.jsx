import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { CheckCircle, XCircle, PartyPopper } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './pages/DashboardOverview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Licenses from './pages/Licenses';
import Downloads from './pages/Downloads'; 
import Enterprise from './pages/Enterprise';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminLicenses from './pages/AdminLicenses';   
import AdminDownloads from './pages/AdminDownloads'; 
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Custom global alert modal state (Intercepts default browser alerts!)
  const [alertData, setAlertData] = useState(null);

  // Global welcome party popper state
  const [showWelcome, setShowWelcome] = useState(false);

  // 1. UNIFIED USER PROFILE FETCH (Runs once on boot)
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // --- THE MAGIC OVERRIDE: Upgrades basic alert() to a beautiful custom modal! ---
    window.alert = (message) => {
      const isError = message.toLowerCase().includes('fail') || 
                      message.toLowerCase().includes('error') || 
                      message.toLowerCase().includes('denied') || 
                      message.toLowerCase().includes('invalid');
                      
      const title = isError ? 'Action Failed' : 'Success!';
      const type = isError ? 'error' : 'success';

      setAlertData({ title, message, type });
    };

    // --- THE CHATBASE EMBED CONFIGURATION 
    window.embeddedChatbotConfig = {
      chatbotId: "rDG2bCiUAUOzFPdMPcdqb",
      domain: "www.chatbase.co"
    };

    // --- CHATBASE SCRIPT LOADER ---
    if (!document.getElementById('chatbase-script')) {
      const script = document.createElement('script');
      script.id = 'chatbase-script';
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.setAttribute('chatbotId', 'rDG2bCiUAUOzFPdMPcdqb'); 
      script.setAttribute('domain', 'www.chatbase.co');
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // 3. TRIGGER WELCOME POPUP ONLY AFTER USER PROFILE LOADS
  useEffect(() => {
    if (user) {
      const showModalFlag = localStorage.getItem('showWelcomeModal');
      if (showModalFlag === 'true') {
        setShowWelcome(true);
        localStorage.removeItem('showWelcomeModal');
      }
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (loading) {
    return <div className="p-8 text-gray-800 dark:text-white font-bold">Loading SEO Dashboard...</div>;
  }

  const isLoggedIn = !!user; 

  return (
    <div className={`flex h-screen bg-transparent relative ${theme === 'dark' ? 'dark' : ''}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* Global Background */}
      <ParticleBackground theme={theme} /> 
      
      {/* Sidebar */}
      <Sidebar user={user} theme={theme} toggleTheme={toggleTheme} /> 
      
      <div className="flex-1 overflow-y-auto">
        <Routes>
          {/* Passed "user" and "setUser" as props to all pages! */}
          <Route path="/" element={isLoggedIn ? <DashboardOverview user={user} /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/pricing" element={<Pricing user={user} />} />
          <Route path="/licenses" element={<Licenses user={user} />} />
          <Route path="/plugin" element={<Downloads user={user} />} />
          <Route path="/enterprise" element={<Enterprise />} />
          
          {/* SECURE ADMIN PATHS */}
          <Route path="/control-center-shaheer" element={<AdminDashboard />} />
          <Route path="/control-center-shaheer/licenses" element={<AdminLicenses />} />
          <Route path="/control-center-shaheer/downloads" element={<AdminDownloads />} />
        </Routes>
      </div>

      {/* --- THE GLOBAL CUSTOM ALERT MODAL --- */}
      {alertData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-slate-700 animate-scale-in relative overflow-hidden transition-colors duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-50 dark:bg-slate-900/40">
              {alertData.type === 'success' ? (
                <CheckCircle className="text-green-500" size={36} />
              ) : (
                <XCircle className="text-red-500" size={36} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{alertData.title}</h3>
            <p className="text-gray-500 dark:text-slate-300 mt-2 text-sm">{alertData.message}</p>
            <button 
              onClick={() => setAlertData(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition duration-200 active:scale-95 shadow-md shadow-blue-500/10"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* --- THE GLOBAL WELCOME / PARTY POPPER POPUP MODAL --- */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border dark:border-slate-700 animate-scale-in relative overflow-hidden transition-colors duration-300">
            
            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/4 left-1/4 animate-ping" />
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full top-1/3 right-1/4 animate-bounce" />
              <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full top-1/2 left-1/3 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute w-2 h-2 bg-green-500 rounded-full top-2/3 right-1/3 animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>

            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1.5s_infinite]">
              <PartyPopper className="text-blue-600 dark:text-blue-400" size={36} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user ? user.name : 'Shaheer'}!</h3>
            <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
              Your dashboard and enterprise settings have loaded successfully. Let's build something awesome today!
            </p>
            
            <button onClick={() => setShowWelcome(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/15">
              Enter Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;