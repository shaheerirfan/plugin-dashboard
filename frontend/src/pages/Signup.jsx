import React, { useState } from 'react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>
        <input className="w-full p-3 mb-4 border rounded" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input className="w-full p-3 mb-4 border rounded" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} />
        <input className="w-full p-3 mb-4 border rounded" type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input className="w-full p-3 mb-6 border rounded" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">Sign Up</button>
      </form>
    </div>
  );
}