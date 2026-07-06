import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AtSign, Camera } from 'lucide-react';

export default function Profile({ user, setUser }) { // Receives user details
  const [formData, setFormData] = useState({ name: '', username: '', profilePic: '', phone: '' });

  // Instantly pre-fills form data from App state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        profilePic: user.profilePic || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profilePic: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: user._id, ...formData }),
      });
      
      const updatedData = await response.json();
      if (response.ok) {
        setUser(updatedData); // Updates the global App state!
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Please Login to view your profile</h2>
        <a href="/login" className="text-blue-600 font-bold underline">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Profile</h2>
      
      <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
          <div className="relative">
            <img 
              src={formData.profilePic || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=2563eb&color=fff`} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 dark:border-slate-700 cursor-pointer"
              onClick={() => document.getElementById('fileInput').click()}
            />
            <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button 
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{formData.name}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Click photo to change.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Username</label>
              <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
              <input disabled type="email" value={user.email} className="w-full p-3 border border-gray-100 bg-gray-50 dark:bg-slate-950 rounded-lg text-gray-400 dark:text-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}