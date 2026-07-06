import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Key, Download, ShoppingCart, User, LogOut, HelpCircle, Shield, Sun, Moon, X, History } from 'lucide-react';

export default function Sidebar({ user, theme, toggleTheme, sidebarOpen, setSidebarOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.role === 'admin');
      })
      .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const renderLink = (path, icon, text, isSubLink = false, isAdminLink = false) => {
    const isActive = location.pathname === path;

    if (isActive) {
      return (
        <Link 
          to={path} 
          className={`group relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 transform translate-x-1 font-bold ${
            isAdminLink 
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
          }`}
        >
          <div className={`absolute left-0 w-1 h-3/5 rounded-r-lg ${isAdminLink ? 'bg-red-600' : 'bg-blue-600'}`} />
          {icon} <span className={isSubLink ? "text-xs pl-4" : "text-sm"}>{text}</span>
        </Link>
      );
    }

    return (
      <Link 
        to={path} 
        className={`group relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 transform hover:translate-x-1 text-gray-500 dark:text-slate-400 ${
          isAdminLink 
            ? 'hover:text-red-600 hover:bg-red-50/40 dark:hover:bg-red-950/20' 
            : 'hover:text-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
        }`}
      >
        <div className={`absolute left-0 w-1 h-3/5 rounded-r-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
          isAdminLink ? 'bg-red-600' : 'bg-blue-600'
        }`} />
        {icon} <span className={isSubLink ? "text-xs pl-4 text-red-600/70" : "text-sm"}>{text}</span>
      </Link>
    );
  };

  return (
    <div className={`w-64 bg-white dark:bg-slate-900 h-screen border-r border-gray-100 dark:border-slate-800 flex flex-col fixed md:relative z-30 transition-all duration-300 ${
      sidebarOpen ? 'left-0 shadow-2xl' : '-left-64 md:left-0'
    }`}>
      
      <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center relative">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">SEO Plugin Pro</h1>
        
        {sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {renderLink('/', <Home size={18} />, 'Dashboard')}
        
        {isLoggedIn && !isAdmin && renderLink('/licenses', <Key size={18} />, 'Licenses')}
        
        {/* --- THE UPGRADE: Changed path to "/plugins" and text to "Plugins" --- */}
        {isLoggedIn && renderLink('/plugin', <Download size={18} />, 'Plugins')}
        
        {renderLink('/pricing', <ShoppingCart size={18} />, 'Pricing')}
        {renderLink('/enterprise', <HelpCircle size={18} />, 'Enterprise')}
        
        {isAdmin && (
          <div className="pt-4 border-t border-gray-50 dark:border-slate-800 space-y-1.5">
            <span className="px-3 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Admin Settings</span>
            {renderLink('/control-center-shaheer', <Shield size={18} />, 'Admin Panel')}
            {renderLink('/control-center-shaheer/licenses', <Key size={16} />, 'License Keys', true)}
            {renderLink('/control-center-shaheer/downloads', <History size={16} />, 'Download Logs', true)}
          </div>
        )}
      </nav>

      {isLoggedIn && renderLink('/profile', <User size={18} />, 'My Profile')}

      <div className="p-4 border-t border-gray-50 dark:border-slate-800 space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-between w-full p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition duration-200"
        >
          <span className="text-xs font-semibold">Appearance</span>
          {theme === 'light' ? <Moon size={18} className="text-blue-600" /> : <Sun size={18} className="text-yellow-400" />}
        </button>

        {isLoggedIn ? (
          <button 
            onClick={() => {
              localStorage.removeItem('token'); 
              window.location.href = '/login';   
            }}
            className="flex items-center space-x-3 text-red-500 hover:text-red-600 p-3 hover:bg-red-50/50 w-full rounded-xl transition-all duration-200 active:scale-95 font-bold text-sm"
          >
            <LogOut size={18} /> <span>Log Out</span>
          </button>
        ) : (
          <div className="space-y-1.5">
            <Link to="/login" className="block text-center text-blue-600 font-bold p-2.5 hover:bg-blue-50/50 rounded-xl text-sm transition-all duration-200">Login</Link>
            <Link to="/signup" className="block text-center text-green-600 font-bold p-2.5 hover:bg-green-50/50 rounded-xl text-sm transition-all duration-200">Create Account</Link>
          </div>
        )}
      </div>
    </div>
  );
}