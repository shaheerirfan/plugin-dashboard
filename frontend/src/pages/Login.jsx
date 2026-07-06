import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('showWelcomeModal', 'true'); // Triggers the party popper!
        window.location.href = '/'; 
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      {/* Card adapts to dark:bg-slate-800/80 and dark:border-slate-700 */}
      <form onSubmit={handleLogin} className="bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-lg w-96 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Login to SEO Plugin</h2>
        
        {/* Inputs adapt to dark:bg-slate-900, dark:border-slate-700, and dark:text-white */}
        <input 
          required 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 mb-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          required 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-6 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200 active:scale-95">Login</button>
        
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-slate-400">
          Don't have an account? <a href="/signup" className="text-blue-600 font-bold">Sign up here</a>
        </p>
      </form>
    </div>
  );
}
