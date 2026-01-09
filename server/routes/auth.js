const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // ✅ make sure you have this middleware
const router = express.Router();

/**
 * Student Registration
 * - Only allows role = 'student'
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, studentId, college, password, role } = req.body;

    if (role !== 'student') {
      return res.status(403).json({ error: "Only students can self-register" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      studentId,
      college,
      password: hashedPassword,
      role: 'student'
    });

    await user.save();
    res.status(201).json({ message: "Student registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Register failed" });
  }
});

/**
 * Superadmin Creates Admins
 * - Protected route
 * - Only superadmin can hit this endpoint
 */
router.post('/create-admin', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: "Only superadmin can create admins" });
    }

    const { fullName, email, password, college } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      fullName,
      email,
      studentId: 'N/A',
      college,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating admin" });
  }
});

/**
 * Login
 * - Works for student, admin, superadmin
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check if user exists (regardless of role)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Check if role matches
    if (user.role !== role) {
      return res.status(400).json({
        error: "Role mismatch",
        details: `Your account is registered as '${user.role}'. Please switch to that tab.`
      });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed due to server error" });
  }
});

/**
 * Get All Users
 * - Only superadmin can access
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    console.log(`[GET /auth/users] Request by ${req.user.id}, role: ${req.user.role}`);
    if (req.user.role !== 'superadmin') {
      console.warn(`[GET /auth/users] Unauthorized access attempt by ${req.user.role}`);
      return res.status(403).json({ error: 'Forbidden' });
    }
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`[GET /auth/users] Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('[GET /auth/users] Error:', err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Return authenticated user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get /me error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Update Self Profile
 * - Students/Admins/Superadmins can update their own info
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, studentId, college, phone } = req.body;
    const userId = req.user.id;

    // Validation for Student ID (if role is student)
    if (req.user.role === 'student' && studentId) {
      // Check if 9 digits and numeric
      if (!/^\d{9}$/.test(studentId)) {
        return res.status(400).json({ error: 'Student ID must be exactly 9 numeric digits.' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, studentId, college, phone },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password for authenticated user
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing password fields' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get all active colleges (centralized from SystemSettings)
router.get('/colleges', async (req, res) => {
  try {
    const { getSettings } = require('../utils/settings');
    const settings = await getSettings();
    res.json(settings.colleges);
  } catch (err) {
    console.error('Fetch colleges error:', err);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Update user (superadmin only)
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Only superadmin can update users' });
    }

    const { fullName, email, college } = req.body;

    // Validate email uniqueness if changed
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: "Email is already in use by another user" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, college },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (superadmin only)
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`[DELETE] Request to delete/users/${req.params.id}`);
    console.log('[DELETE] Requester:', req.user);

    if (req.user.role !== 'superadmin') {
      console.log('[DELETE] Failed: Requester is not superadmin');
      return res.status(403).json({ error: 'Forbidden: Only superadmin can delete users' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('[DELETE] Failed: User not found in DB');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[DELETE] Success: User ${req.params.id} deleted.`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('[DELETE] Error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
