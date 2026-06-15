const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const License = require('../models/License');

const router = express.Router();

// Helper Function: Generates a beautiful key like "SEO-PRO-A1B2-C3D4-E5F6"
function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'SEO-PRO-';
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key += segment + (i < 2 ? '-' : '');
  }
  return key;
}

// 1. GENERATE A NEW LICENSE KEY (ADMIN ONLY)
router.post('/generate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the requester is actually an admin
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { userEmail, plan, siteLimit } = req.body;

    // Create the license
    const newLicense = new License({
      key: generateRandomKey(),
      userEmail,
      plan,
      siteLimit: Number(siteLimit)
    });

    await newLicense.save();
    res.status(201).json(newLicense);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate key" });
  }
});

// 2. FETCH ALL LICENSE KEYS (ADMIN ONLY)
router.get('/all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const licenses = await License.find({});
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch licenses" });
  }
});

// 3. TOGGLE LICENSE STATUS (BLOCK / UNBLOCK KEY)
router.put('/toggle-status', async (req, res) => {
  try {
    const { licenseId, currentStatus } = req.body;
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    const updated = await License.findByIdAndUpdate(
      licenseId, 
      { status: newStatus }, 
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update license status" });
  }
});

module.exports = router;