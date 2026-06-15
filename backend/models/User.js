const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  plan: { type: String, default: "trial" }, 
  trialExpires: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  },
  
  // THIS IS THE DATABASE CODE WE MUST ADD!
  role: { type: String, default: "user" } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 