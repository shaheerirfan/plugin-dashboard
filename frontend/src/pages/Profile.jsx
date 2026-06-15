import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, AtSign, Camera } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', username: '', profilePic: '', phone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
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
          setFormData({
            name: data.name || '',
            username: data.username || '',
            profilePic: data.profilePic || '',
            phone: data.phone || ''
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
        setUser(updatedData);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (!user) return <div className="p-8">Please login to view profile.</div>;

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
          <div className="relative">
            <img 
              src={formData.profilePic || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=2563eb&color=fff`} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 cursor-pointer"
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
            <h3 className="text-xl font-bold text-gray-800">{formData.name}</h3>
            <p className="text-gray-500 text-sm">Click photo to change.</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input disabled type="email" value={user.email} className="w-full p-3 border border-gray-100 bg-gray-50 rounded-lg text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
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