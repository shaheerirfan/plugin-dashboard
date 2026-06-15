import React from 'react';

export default function Licenses() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">My Licenses</h2>
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <p className="text-yellow-800 mb-4">You do not have an active license yet.</p>
        <a href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
          Go to Pricing
        </a>
      </div>
    </div>
  );
}