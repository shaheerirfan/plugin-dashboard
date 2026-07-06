import React, { useState, useEffect } from 'react';

export default function Pricing({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  const defaultPlans = [
    {
      id: 'single_site',
      name: 'Single Site',
      description: 'Perfect for a single personal WordPress website.',
      prices: { monthly: '$5', yearly: '$49' }, 
      features: ['1 WordPress Site', 'All SEO core audits', '30-day index history', 'Basic Email Support']
    },
    {
      id: 'unlimited_sites',
      name: 'Unlimited Sites',
      description: 'Best for agencies, developers, and power users.',
      prices: { monthly: '$19', yearly: '$149' }, 
      features: ['Unlimited WordPress Sites', 'All SEO core audits', 'Unlimited index history', 'Priority 24/7 Support', 'Custom Schema Generator']
    }
  ];

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('saas_plans_v2');
    return saved ? JSON.parse(saved) : defaultPlans;
  });

  const [userCurrentPlan, setUserCurrentPlan] = useState('trial');

  // Tracks the active billing cycle for each card individually!
  const [billingCycles, setBillingCycles] = useState({
    single_site: 'monthly',
    unlimited_sites: 'monthly'
  });

  useEffect(() => {
    const fetchUserPlan = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserCurrentPlan(data.plan || 'trial');
          setIsAdmin(data.role === 'admin'); 
        }
      } catch (err) {
        console.error("Error fetching user plan:", err);
      }
    };
    fetchUserPlan();
  }, [user]);

  // Toggle billing mode inside a specific card
  const toggleBilling = (planId) => {
    setBillingCycles(prev => ({
      ...prev,
      [planId]: prev[planId] === 'monthly' ? 'yearly' : 'monthly'
    }));
  };

  const handleEditChange = (planId, field, value) => {
    const updated = plans.map(p => p.id === planId ? { ...p, [field]: value } : p);
    setPlans(updated);
  };

  const handlePriceChange = (planId, mode, value) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        return { ...p, prices: { ...p.prices, [mode]: value } };
      }
      return p;
    });
    setPlans(updated);
  };

  const handleFeatureChange = (planId, index, value) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        const newFeatures = [...p.features];
        newFeatures[index] = value;
        return { ...p, features: newFeatures };
      }
      return p;
    });
    setPlans(updated);
  };

  const addFeature = (planId) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        return { ...p, features: [...p.features, 'New Feature'] };
      }
      return p;
    });
    setPlans(updated);
  };

  const deleteFeature = (planId, indexToDelete) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        const filteredFeatures = p.features.filter((_, index) => index !== indexToDelete);
        return { ...p, features: filteredFeatures };
      }
      return p;
    });
    setPlans(updated);
  };

  const savePlans = () => {
    localStorage.setItem('saas_plans_v2', JSON.stringify(plans));
    setEditingId(null);
    alert("Plans updated successfully!");
  };

  const handleBuyNow = async (planId, billing) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to purchase a plan.");
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing, token }) // Passes both planId and billing!
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errData = await response.json();
        alert("Checkout Failed: " + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert("Connection error.");
    }
  };

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Get full access to SEO Inspector. Cancel anytime.</p>
      </div>

      {/* Centered 2-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const currentCycle = billingCycles[plan.id];
          const displayPrice = plan.prices[currentCycle];

          return (
            <div 
              key={plan.id} 
              className={`bg-white dark:bg-slate-800/80 p-8 rounded-2xl shadow-sm border flex flex-col relative overflow-hidden transition-all duration-300 ${
                plan.id === 'unlimited_sites' 
                  ? 'border-blue-200 dark:border-blue-900/50 shadow-blue-500/5' 
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              {/* Highlight Badge for Unlimited / Best Value */}
              {plan.id === 'unlimited_sites' && (
                <div className="absolute top-0 right-16 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg uppercase tracking-wider">
                  Best Value
                </div>
              )}
              
              {/* ADMIN EDIT / SAVE CONTROLS */}
              {isAdmin && (
                <div className="absolute top-4 right-4">
                  {isEditing ? (
                    <button onClick={savePlans} className="bg-green-600 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-green-700 transition">
                      Save
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(plan.id)} className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-blue-700 transition">
                      Edit
                    </button>
                  )}
                </div>
              )}

              {/* PLAN NAME */}
              {isEditing ? (
                <input type="text" value={plan.name} onChange={(e) => handleEditChange(plan.id, 'name', e.target.value)} className="text-xl font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-slate-900 p-1 rounded outline-none border mb-2 w-3/5" />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
              )}

              {/* PLAN DESCRIPTION */}
              {isEditing ? (
                <textarea rows="2" value={plan.description} onChange={(e) => handleEditChange(plan.id, 'description', e.target.value)} className="text-sm text-gray-500 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 p-1 rounded outline-none border w-full resize-none" />
              ) : (
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 min-h-[48px]">{plan.description}</p>
              )}

              {/* --- IN-CARD BILLING CYCLE PILL TOGGLE --- */}
              {!isEditing && (
                <div className="flex items-center space-x-2 mt-4 bg-gray-50 dark:bg-slate-900/60 p-1 rounded-xl w-fit border dark:border-slate-800/80 shadow-inner">
                  <button 
                    onClick={() => toggleBilling(plan.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      currentCycle === 'monthly' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => toggleBilling(plan.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      currentCycle === 'yearly' 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-400'
                    }`}
                  >
                    Annually {currentCycle === 'yearly' && <span className="text-[10px] text-green-500 font-bold ml-1">Save 20%</span>}
                  </button>
                </div>
              )}
              
              {/* PRICE */}
              <div className="my-6">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-16 font-bold">Monthly:</span>
                      <input type="text" value={plan.prices.monthly} onChange={(e) => handlePriceChange(plan.id, 'monthly', e.target.value)} className="p-1 border rounded bg-gray-50 dark:bg-slate-900 dark:text-white w-20" />
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-16 font-bold">Yearly:</span>
                      <input type="text" value={plan.prices.yearly} onChange={(e) => handlePriceChange(plan.id, 'yearly', e.target.value)} className="p-1 border rounded bg-gray-50 dark:bg-slate-900 dark:text-white w-20" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white transition-all duration-300">{displayPrice}</span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-semibold ml-1">
                      {currentCycle === 'yearly' ? '/Yr' : '/Mo'}
                    </span>
                  </div>
                )}
              </div>

              {/* UPGRADE BUTTONS */}
              {userCurrentPlan === plan.id ? (
                <button disabled className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-lg border border-green-200 cursor-not-allowed mb-6 text-sm">
                  Current Plan
                </button>
              ) : (
                <button 
                  onClick={() => handleBuyNow(plan.id, currentCycle)}
                  className="w-full bg-white dark:bg-slate-900 text-gray-800 dark:text-white font-bold py-3 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-950 transition mb-6 text-sm"
                >
                  Buy Now
                </button>
              )}

              {/* FEATURES LIST */}
              <div className="flex-1">
                <p className="font-semibold text-sm mb-4 dark:text-slate-300">Features:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                      <span className="text-pink-500 mr-2">✓</span>
                      {isEditing ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input type="text" value={feature} onChange={(e) => handleFeatureChange(plan.id, index, e.target.value)} className="bg-gray-50 dark:bg-slate-900 p-1 border rounded text-xs text-gray-800 dark:text-white flex-1 outline-none" />
                          <button 
                            type="button" 
                            onClick={() => deleteFeature(plan.id, index)} 
                            className="text-red-500 hover:text-red-700 text-base font-extrabold px-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <span>{feature}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {isEditing && (
                  <button onClick={() => addFeature(plan.id)} className="mt-4 text-xs text-blue-500 hover:text-blue-600 font-bold">
                    + Add Feature
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}