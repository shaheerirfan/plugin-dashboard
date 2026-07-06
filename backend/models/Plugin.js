const mongoose = require('mongoose');

const PluginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  version: { type: String, required: true },
  fileSize: { type: String, required: true },
  fileName: { type: String, required: true } // Saved as a unique file name on the server's disk
}, { timestamps: true });

module.exports = mongoose.model('Plugin', PluginSchema);