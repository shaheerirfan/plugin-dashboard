const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  plan: { type: String, default: "essential" },
  siteLimit: { type: Number, default: 1 },
  activatedSites: { type: [String], default: [] },
  status: { type: String, default: "active" },
  expiresAt: { type: Date, required: true } // --- ADDED EXPIRY DATE ---
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);