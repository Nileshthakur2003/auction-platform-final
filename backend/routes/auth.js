const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { authenticate, SECRET_KEY } = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

    if (!username || !email || !password || userType === undefined) {
      return res.status(400).json({ message: 'All input fields are required (username, email, password, userType)' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      userType: String(userType),
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // CRITICAL FIX: Check user existence BEFORE dereferencing user.userType
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user_type = (user.userType === '0' || user.userType === 0) ? 0 : 1;

    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Signin successful',
      token,
      user: user_type,
      userType: String(user.userType),
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validate Token
router.get('/validate-token', authenticate, (req, res) => {
  const userRecord = {
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    userType: req.user.userType,
  };
  res.status(200).json(userRecord);
});

// Profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const userdata = {
      username: user.username,
      email: user.email,
      userType: user.userType,
    };
    res.status(200).json({ data: userdata });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Profile
router.post('/updateprofile', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updateFields = {};
    if (username) {
      const normalizedUsername = username.trim();
      const existingUser = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already in use' });
      }
      updateFields.username = normalizedUsername;
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      updateFields.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        username: updatedUser.username,
        email: updatedUser.email,
        userType: updatedUser.userType,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Helper: Get username by ID (supports query param, route param, or body)
router.all(['/getUsernameById', '/getUsernameById/:id'], async (req, res) => {
  try {
    const userId = req.params.id || req.query.userId || req.body?.userId;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error('Fetching username error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
