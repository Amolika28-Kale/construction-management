const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth'); 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER API 
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("Received:", req.body);

  try {
    if (!["supervisor", "technician"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedUser = await newUser.save();
    console.log("User saved:", savedUser);

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN API 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Welcome to your profile',
    user: req.user 
  });
});

router.get('/admin-dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  res.json({
    message: 'Welcome to the admin dashboard',
    user: req.user
  });
});

module.exports = router;
