import React, { useState } from 'react';

export default function Pricing() {
  // Right now, we are pretending the logged-in user owns the "Essential" plan.
  // Later, this will come directly from your MongoDB database!
  const [userCurrentPlan, setUserCurrentPlan] = useState('essential');

  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      description: 'For a basic website',
      price: '$5',
      features: ['1 site', '57 Editor Pro widgets', 'Basic Support', '10 Cloud Templates']
    },
    {
      id: 'advanced_solo',
      name: 'Advanced Solo',
      description: 'For a professional website',
      price: '$7',
      features: ['1 site', '85 Editor Pro widgets', 'Basic Support', '20 Cloud Templates']
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For 3 professional websites',
      price: '$9',
      features: ['3 sites', '85 Editor Pro widgets', 'Priority Support', '30 Cloud Templates']
    }
  ];

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Upgrade your SEO capabilities today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <p className="text-gray-500 text-sm mt-2 min-h-[40px]">{plan.description}</p>
            
            <div className="my-6">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
              <span className="text-gray-500">/Mo</span>
            </div>

            {/* THIS IS THE MAGIC LOGIC FOR "CURRENT PLAN" VS "BUY NOW" */}
            {userCurrentPlan === plan.id ? (
              <button disabled className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-lg border border-green-200 cursor-not-allowed mb-6">
                Current Plan
              </button>
            ) : (
              <button className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition mb-6">
                Buy Now
              </button>
            )}

            <div className="flex-1">
              <p className="font-semibold text-sm mb-4">Features:</p>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-pink-500 mr-2">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}