import React, { useState } from 'react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token); // Auto-login!
        localStorage.setItem('showWelcomeModal', 'true'); // Triggers the party popper!
        alert("Account created successfully!");
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
      <form onSubmit={handleSignup} className="bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-lg w-96 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create Account</h2>
        
        {/* Inputs adapt to dark:bg-slate-900, dark:border-slate-700, and dark:text-white */}
        <input required className="w-full p-3 mb-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input required className="w-full p-3 mb-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} />
        <input required className="w-full p-3 mb-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input required className="w-full p-3 mb-6 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:border-blue-500" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200 active:scale-95">Sign Up</button>
        
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-slate-400">
          Already have an account? <a href="/login" className="text-blue-600 font-bold">Login here</a>
        </p>
      </form>
    </div>
  );
}