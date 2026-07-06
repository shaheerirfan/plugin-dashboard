const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// --- 1. RESTRUCTURED PRICE MAPPING (In Cents: $5, $49, $19, $149) ---
const planPrices = {
  single_site: {
    monthly: { name: "Single Site (Monthly)", amount: 500 }, 
    yearly: { name: "Single Site (Yearly)", amount: 4900 }  
  },
  unlimited_sites: {
    monthly: { name: "Unlimited Sites (Monthly)", amount: 1900 }, 
    yearly: { name: "Unlimited Sites (Yearly)", amount: 14900 }  
  }
};

// CREATE SECURE STRIPE CHECKOUT LINK
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, billing, token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const selectedPlan = planPrices[planId]?.[billing];
    if (!selectedPlan) return res.status(400).json({ message: "Invalid plan or billing selection" });

    // Creates Stripe checkout screen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: `Upgrade to ${selectedPlan.name} (${billing === 'yearly' ? 'Yearly Billing' : 'Monthly Billing'})`,
            },
            unit_amount: selectedPlan.amount, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: user.email,
      success_url: `http://localhost:5173/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/pricing`,
      metadata: {
        userId: user._id.toString(),
        planId: planId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// VERIFY RECEIPT & UPGRADE USER PLAN
const sendEmail = require('../utils/sendEmail');

router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      const planId = session.metadata.planId;
      const user = await User.findById(userId);
      
      // 1. Calculate Expiry Date (1 Year for Yearly, 1 Month for Monthly)
      const expiresAt = new Date();
      if (session.amount_total > 4000) { 
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // 2. Generate and Save License Key
      const newKey = "SEO-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newLicense = new License({
        key: newKey,
        userEmail: user.email,
        plan: planId,
        siteLimit: planId === 'pro' ? 3 : 1,
        expiresAt: expiresAt
      });
      await newLicense.save();

      // 3. Update User Plan
      await User.findByIdAndUpdate(userId, { plan: planId, trialExpires: expiresAt });
      
      // 4. Send Email
      await sendEmail(user.email, "Your License Key", `Your license key is: ${newKey}`, `<h1>Your Key: ${newKey}</h1><p>Plan expires: ${expiresAt.toLocaleDateString()}</p>`);
      
      res.json({ success: true, message: "Upgrade successful!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;