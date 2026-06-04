const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a brand new trader account
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists in system database
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Account email already registered.' });
    }

    user = new User({ username, email, password });

    // Encrypt the password before storing
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create and return secure session token
    const payload = { id: user._id };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', 
      { expiresIn: '7d' } // Session stays logged in for 7 days
    );

    res.status(201).json({ token, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate credentials and return session token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid registration credentials.' });
    }

    // Compare submitted password against secure hashed storage
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid registration credentials.' });
    }

    const payload = { id: user._id };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', 
      { expiresIn: '7d' }
    );

    res.json({ token, message: 'Welcome back, trader!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/logout
// @desc    User logout (Handled natively by frontend destroying token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Session closed. Token clearance requested.' });
});

module.exports = router;
    
