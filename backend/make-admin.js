const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to your database using your .env settings
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to database, updating account...');
    
    // Your exact email from the screenshot
    const targetEmail = 'shaheerirfan@encodersstudio.com'; 

    // This updates your role to "admin" and deletes the broken field we made earlier!
    const updatedUser = await User.findOneAndUpdate(
      { email: targetEmail },
      { 
        $set: { role: 'admin' },
        $unset: { 'role (Type: String) with value "admin"': "" } 
      },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ SUCCESS! Your account has been updated to Admin.');
      console.log(`User: ${updatedUser.name} | Role: ${updatedUser.role}`);
    } else {
      console.log(`❌ ERROR: Could not find a user with the email: ${targetEmail}`);
    }

    // Safely close the database connection
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
  });