const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Create admin for a college
router.post('/admins', requireAuth, requireRole('super_admin'), async (req, res) => {
  const { name, email, password, college } = req.body;
  if (!name || !email || !password || !college) return res.status(400).json({ message: 'Missing fields' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = new User({ name, email, passwordHash, role: 'admin', college });
  await admin.save();
  res.status(201).json({ id: admin._id, name: admin.name, email: admin.email, college: admin.college });
});

// List admins
router.get('/admins', requireAuth, requireRole('super_admin'), async (_req, res) => {
  const admins = await User.find({ role: 'admin' }).select('name email college');
  res.json(admins);
});

module.exports = router;
