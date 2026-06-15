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
  window.location.href = '/'; // IMPORTANT: This triggers the sidebar to re-check the token
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Login to SEO Plugin</h2>
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-3 mb-6 border rounded" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">Login</button>
        <p className="mt-4 text-center text-sm text-gray-600">
  Don't have an account? <a href="/signup" className="text-blue-600 font-bold">Sign up here</a>
</p>
      </form>
    </div>
  );
}