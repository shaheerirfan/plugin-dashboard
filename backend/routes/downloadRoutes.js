const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const Download = require('../models/Download');
const Plugin = require('../models/Plugin'); 

const router = express.Router();

// Create uploads directory if it does not exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CONFIGURE MULTER FOR UNIQUE FILENAMES (Prevents overwriting!)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generates a unique prefix (timestamp + random number) to prevent file collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 1. UPLOAD NEW PRODUCT ZIP (ADMIN ONLY)
router.post('/upload', upload.single('pluginZip'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, version, description } = req.body;

    // Calculate file size automatically in Megabytes (MB)
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Save metadata in MongoDB
    const newPlugin = new Plugin({
      name,
      description,
      version,
      fileSize: sizeInMB,
      fileName: req.file.filename
    });

    await newPlugin.save();
    res.status(201).json({ success: true, message: "Plugin uploaded and registered!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload file" });
  }
});

// 2. FETCH ALL AVAILABLE PLUGINS (FOR LOGGED-IN USERS)
router.get('/plugins', async (req, res) => {
  try {
    const plugins = await Plugin.find({}).sort({ createdAt: -1 });
    res.json(plugins);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plugins" });
  }
});

// 3. SECURE DOWNLOAD ROUTE BY PLUGIN ID
router.get('/download/:id', async (req, res) => {
  try {
    const plugin = await Plugin.findById(req.params.id);
    if (!plugin) return res.status(404).json({ message: "Plugin not found" });

    const filePath = path.join(__dirname, '../uploads/', plugin.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Streams the actual ZIP file and renames it to its original upload name
    const originalName = plugin.fileName.split('-').slice(2).join('-');
    res.download(filePath, originalName || 'plugin.zip');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Download failed" });
  }
});

// 4. DELETE A PRODUCT & REMOVE ITS FILE FROM DISK (ADMIN ONLY)
router.delete('/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const plugin = await Plugin.findById(req.params.id);
    if (!plugin) return res.status(404).json({ message: "Plugin not found" });

    // Delete the physical file from the disk securely
    const filePath = path.join(__dirname, '../uploads/', plugin.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document metadata from MongoDB
    await Plugin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Plugin deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete plugin" });
  }
});

// 5. LOG A DOWNLOAD
router.post('/log', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newDownload = new Download({
      userEmail: user.email,
      version: req.body.version || "v1.0.0"
    });

    await newDownload.save();
    res.status(201).json({ success: true, message: "Download logged" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log download" });
  }
});

// 6. FETCH ALL DOWNLOAD LOGS (ADMIN ONLY)
router.get('/all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const downloads = await Download.find({}).sort({ createdAt: -1 }); 
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch download logs" });
  }
});
// GET DOWNLOADS STATS (ADMIN ONLY - REAL-TIME MONTHLY, WEEKLY, & SPECIFIC MONTH FILTER!)
router.get('/admin/stats/downloads', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const timeframe = req.query.timeframe || 'monthly';
    const selectedMonthQuery = req.query.month || 'all';
    
    const downloads = await Download.find({}, 'createdAt').lean();

    const labels = [];
    const counts = [0, 0, 0, 0, 0];

    // ===========================================
    // 📅 SCENARIO A: WEEKLY VIEW (WITH MONTH FILTER)
    // ===========================================
    if (timeframe === 'weekly') {
      if (selectedMonthQuery !== 'all') {
        const monthIdx = parseInt(selectedMonthQuery);
        
        labels.push("Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5");

        downloads.forEach(d => {
          if (d.createdAt) {
            const created = new Date(d.createdAt);
            const dYear = created.getFullYear();
            const dMonth = created.getMonth();
            const dDate = created.getDate();

            // Filter downloads in 2026 and chosen month
            if (dYear === 2026 && dMonth === monthIdx) {
              if (dDate >= 1 && dDate <= 7) counts[0]++;
              else if (dDate >= 8 && dDate <= 14) counts[1]++;
              else if (dDate >= 15 && dDate <= 21) counts[2]++;
              else if (dDate >= 22 && dDate <= 28) counts[3]++;
              else if (dDate >= 29) counts[4]++;
            }
          }
        });
      } else {
        // Fallback: Rolling 5 weeks
        const today = new Date();
        const weekLimits = [];
        for (let i = 0; i < 5; i++) {
          const start = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const end = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          weekLimits.push({ start, end });
          labels.unshift(`Wk ${5 - i}`);
        }

        downloads.forEach(d => {
          if (d.createdAt) {
            const created = new Date(d.createdAt);
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

      downloads.forEach(d => {
        if (d.createdAt) {
          const dMonth = new Date(d.createdAt).getMonth();
          const idx = monthIndices.indexOf(dMonth);
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