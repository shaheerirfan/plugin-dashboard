const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const License = require('../models/License');

const router = express.Router();

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

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userEmail, plan, siteLimit } = req.body;

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

    const licenses = await License.find({}).lean();
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

// 4. FETCH CURRENT LOGGED-IN USER'S LICENSES (USER PORTAL - NEW!)
router.get('/my-licenses', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the logged-in user
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Find only the licenses owned by this user's email
    const licenses = await License.find({ userEmail: currentUser.email }).lean();
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your licenses" });
  }
});

// 5. DEACTIVATE DOMAIN (USER SELF-SERVICE)
router.put('/deactivate-domain', async (req, res) => {
  try {
    const { licenseId, domain } = req.body;

    // Pulls (removes) the specific domain from the activatedSites array
    const updatedLicense = await License.findByIdAndUpdate(
      licenseId,
      { $pull: { activatedSites: domain } },
      { new: true }
    );

    res.json(updatedLicense);
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate domain" });
  }
});

module.exports = router;