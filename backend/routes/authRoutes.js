const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// SIGN UP ROUTE (UPDATED FOR AUTO-LOGIN & AUTOMATED WELCOME EMAIL)
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();

    // --- AUTOMATED WELCOME EMAIL ---
    const emailSubject = "Welcome to SEO Plugin Pro!";
    const emailText = `Hi ${name},\n\nWelcome to SEO Plugin Pro! Your 30-day free trial has been successfully activated.\n\nBest regards,\nShaheer`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to SEO Plugin Pro!</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>We are excited to have you! Your 30-day free trial has been successfully activated and is ready to use.</p>
        <p>Head to your dashboard to manage your license keys and download the plugin files.</p>
        <br />
        <p>Best regards,<br/><b>Shaheer</b><br/>Founder, SEO Plugin Pro</p>
      </div>
    `;
    // Sends the welcome email behind the scenes
    await sendEmail(email, emailSubject, emailText, emailHtml);

    // Generate a login token automatically right after creating the account!
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, plan: newUser.plan }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate Login Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// GET USER PROFILE
router.get('/me', async (req, res) => {
  try {
    // This gets the token from the request header
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID and send them back
    const user = await User.findById(decoded.id).lean();
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
});

// UPDATE PROFILE ROUTE (Updated to support username updates!)
router.put('/update-profile', async (req, res) => {
  try {
    const { id, name, username, phone, profilePic } = req.body; // Added username here!
    console.log("Updating user:", id, name, username, phone, profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { name, username, phone, profilePic }, // Added username here!
      { new: true }
    );
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// GET ALL USERS (ADMIN ONLY)
router.get('/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the logged-in user making the request
    const currentUser = await User.findById(decoded.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Fetch all registered users (excluding passwords for safety)
    const users = await User.find({}, '-password'); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE USER PLAN (ADMIN ONLY)
router.put('/admin/update-plan', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify requester is an admin
    const currentUser = await User.findById(decoded.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { userId, plan } = req.body;
    
    // Set expiry: 1 year for paid plans, 30 days if downgraded to trial
    let trialExpires = new Date();
    if (plan === 'trial') {
      trialExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      trialExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { plan, trialExpires }, 
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan" });
  }
});

// DELETE A USER (ADMIN ONLY - WITH SECURITY SAFEGUARDS)
router.delete('/admin/delete-user/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the logged-in user is actually an admin
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // SECURITY SAFEGUARD: Block admin from deleting themselves!
    if (currentUser._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Security block: You cannot delete your own admin account!" });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// GET SIGNUPS STATS (ADMIN ONLY - REAL-TIME MONTHLY, WEEKLY, & SPECIFIC MONTH FILTER!)
router.get('/admin/stats/signups', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const timeframe = req.query.timeframe || 'monthly'; // 'monthly' or 'weekly'
    const selectedMonthQuery = req.query.month || 'all'; // 'all' or '0' (Jan) to '11' (Dec)
    
    const users = await User.find({}, 'createdAt').lean();

    const labels = [];
    const counts = [0, 0, 0, 0, 0];

    // ===========================================
    // 📅 SCENARIO A: WEEKLY VIEW (WITH MONTH FILTER)
    // ===========================================
    if (timeframe === 'weekly') {
      if (selectedMonthQuery !== 'all') {
        const monthIdx = parseInt(selectedMonthQuery);
        
        // Static labels for the weeks of your selected month
        labels.push("Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5");

        users.forEach(u => {
          if (u.createdAt) {
            const created = new Date(u.createdAt);
            const uYear = created.getFullYear();
            const uMonth = created.getMonth();
            const uDate = created.getDate();

            // Filter users who registered in the year 2026 and your chosen month!
            if (uYear === 2026 && uMonth === monthIdx) {
              if (uDate >= 1 && uDate <= 7) counts[0]++;
              else if (uDate >= 8 && uDate <= 14) counts[1]++;
              else if (uDate >= 15 && uDate <= 21) counts[2]++;
              else if (uDate >= 22 && uDate <= 28) counts[3]++;
              else if (uDate >= 29) counts[4]++;
            }
          }
        });
      } else {
        // Fallback: Rolling last 5 weeks relative to today
        const today = new Date();
        const weekLimits = [];
        for (let i = 0; i < 5; i++) {
          const start = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const end = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          weekLimits.push({ start, end });
          labels.unshift(`Wk ${5 - i}`);
        }

        users.forEach(u => {
          if (u.createdAt) {
            const created = new Date(u.createdAt);
            for (let i = 0; i < 5; i++) {
              if (created >= weekLimits[i].start && created < weekLimits[i].end) {
                counts[4 - i]++;
                break;
              }
            }
          }
        });
      }
    } 
    // ===========================================
    // 📅 SCENARIO B: MONTHLY VIEW
    // ===========================================
    else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      const monthIndices = [];

      for (let i = 4; i >= 0; i--) {
        let mIdx = currentMonth - i;
        if (mIdx < 0) mIdx += 12;
        labels.push(monthNames[mIdx]);
        monthIndices.push(mIdx);
      }

      users.forEach(u => {
        if (u.createdAt) {
          const uMonth = new Date(u.createdAt).getMonth();
          const idx = monthIndices.indexOf(uMonth);
          if (idx !== -1) {
            counts[idx]++;
          }
        }
      });
    }

    res.json({ labels, counts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;