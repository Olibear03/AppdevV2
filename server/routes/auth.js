const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, studentId, college, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, studentId, college, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: "Register failed" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: "Invalid email/role" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(400).json({ error: "Login failed" });
  }
});

module.exports = router;
