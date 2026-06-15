import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Key, Download, ShoppingCart, User, LogOut, HelpCircle, Shield } from 'lucide-react';

export default function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Tracks if the user is an admin

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      // Ask the backend if the current user is an admin
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

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed md:relative hidden md:flex">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">SEO Plugin Pro</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
          <Home size={20} /> <span>Dashboard</span>
        </Link>
        <Link to="/licenses" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
          <Key size={20} /> <span>Licenses</span>
        </Link>
        <Link to="/downloads" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
          <Download size={20} /> <span>Downloads</span>
        </Link>
        <Link to="/pricing" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <ShoppingCart size={20} /> <span>Pricing</span>
        </Link>
        <Link to="/enterprise" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors">
            <HelpCircle size={20} /> <span>Enterprise</span>
        </Link>
        
        {/* ONLY SHOW ADMIN LINKS IF LOGGED IN USER IS ADMIN */}
        {isAdmin && (
          <div className="space-y-1">
            <Link to="/admin" className="flex items-center space-x-3 text-red-700 p-3 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors font-semibold">
                <Shield size={20} /> <span>Admin Panel</span>
            </Link>
            {/* NESTED LICENSE KEY MANAGER SUB-LINK */}
            <Link to="/admin/licenses" className="flex items-center space-x-3 text-red-700 pl-8 p-2 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors text-sm">
                <Key size={16} /> <span>License Keys</span>
            </Link>
          </div>
        )}
      </nav>

      {isLoggedIn && (
        <Link to="/profile" className="flex items-center space-x-3 text-gray-700 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <User size={20} /> <span>My Profile</span>
        </Link>
      )}

      <div className="p-4 border-t border-gray-200">
        {isLoggedIn ? (
          <button 
            onClick={() => {
              localStorage.removeItem('token'); 
              window.location.href = '/login';   
            }}
            className="flex items-center space-x-3 text-red-600 p-3 hover:bg-red-50 w-full rounded-lg transition-colors"
          >
            <LogOut size={20} /> <span>Log Out</span>
          </button>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="block text-blue-600 font-bold p-2 hover:bg-blue-50 rounded-lg">Login</Link>
            <Link to="/signup" className="block text-green-600 font-bold p-2 hover:bg-green-50 rounded-lg">Create Account</Link>
          </div>
        )}
      </div>
    </div>
  );
}