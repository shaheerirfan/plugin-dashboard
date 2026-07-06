import React, { useState } from 'react';
import { ShieldCheck, Award, Lock } from 'lucide-react';

export default function Enterprise() {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: '', jobTitle: '', company: '', companySize: '',
    companyUrl: '', help: '', idealPlan: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      country: '', jobTitle: '', company: '', companySize: '',
      companyUrl: '', help: '', idealPlan: ''
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-8 md:p-12 flex items-center justify-center relative overflow-y-auto w-full">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Dark-mode text colors */}
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-400 uppercase tracking-wider">
            SEO Plugin Pro solutions for enterprises
          </h4>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-950 dark:text-white leading-tight">
            An enterprise solution made for big ambitions
          </h1>
          <p className="text-lg text-gray-700 dark:text-slate-300 leading-relaxed">
            Empower global teams to build and scale high-performance websites with enterprise-grade security, centralized governance, and seamless operational control.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
              <ShieldCheck className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
              <Award className="text-green-600 dark:text-green-400" size={20} />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
              <Lock className="text-purple-600 dark:text-purple-400" size={20} />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">GDPR Ready</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">First Name *</label>
                <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Last Name *</label>
                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Business Email *</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Phone number *</label>
                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Country *</label>
                <select required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400">
                  <option value="">Select</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="PK">Pakistan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Job Title *</label>
                <input required type="text" value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Company *</label>
                <input required type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Size *</label>
                <select required value={formData.companySize} onChange={(e) => setFormData({...formData, companySize: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400">
                  <option value="">Select</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company URL</label>
                <input type="url" placeholder="https://" value={formData.companyUrl} onChange={(e) => setFormData({...formData, companyUrl: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">How can we help? *</label>
                <select required value={formData.help} onChange={(e) => setFormData({...formData, help: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-pink-400">
                  <option value="">Select</option>
                  <option value="sales">I want to buy enterprise licenses</option>
                  <option value="demo">I want a customized demo</option>
                  <option value="support">I need enterprise support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Describe your ideal plan *</label>
              <textarea required rows="2" value={formData.idealPlan} onChange={(e) => setFormData({...formData, idealPlan: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-white outline-none resize-none" />
            </div>

            <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-tight">
              By submitting this form, you agree to receive SEO Plugin emails, including marketing emails, and to our <span className="underline cursor-pointer">T&C's</span> & <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>

            <button type="submit" className="bg-black dark:bg-slate-950 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 dark:hover:bg-slate-900 transition">
              Book demo
            </button>
          </form>
        </div>

      </div>

      {/* POPUP / MODAL (Adapts to dark mode) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border dark:border-slate-700 space-y-4">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-950/40 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-pink-600 dark:text-pink-400" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Thank you for your submission!</h3>
            <p className="text-gray-600 dark:text-slate-300">
              We will get back to you via email very soon.
            </p>
            <button 
              onClick={closePopup}
              className="w-full bg-black dark:bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-slate-900 transition"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}