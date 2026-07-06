const mongoose = require('mongoose');

const DownloadSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  version: { type: String, default: "v1.0.0" }
}, { timestamps: true }); // Automatically adds 'createdAt' date and time!

module.exports = mongoose.model('Download', DownloadSchema);