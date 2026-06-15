const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// This allows your frontend to talk to your backend safely
app.use(cors());
app.use(express.json());

// Import Routes (Clean and unique)
const authRoutes = require('./routes/authRoutes');
const licenseRoutes = require('./routes/licenseRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);

// This tries to connect to your database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected successfully!'))
  .catch(err => console.log('❌ DATABASE ERROR:', err.message));

// A simple test to see if the server is awake
app.get('/', (req, res) => {
  res.send("Hello! The backend server is working!");
});

// This turns the server on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));