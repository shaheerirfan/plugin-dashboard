const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  plan: { type: String, default: "essential" }, // essential, pro, advanced_solo
  siteLimit: { type: Number, default: 1 }, // how many sites are allowed (e.g., 1, 3, or 999 for unlimited)
  activatedSites: { type: [String], default: [] }, // exact URLs where key is active (e.g. ['https://myblog.com'])
  status: { type: String, default: "active" } // active, suspended, expired
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);