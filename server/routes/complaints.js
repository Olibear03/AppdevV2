const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const Complaint = require('../models/Complaint');
const User = require('../models/User'); // Ensure User model is loaded
const Notification = require('../models/Notification'); // Import Notification model
const authMiddleware = require('../middleware/auth');

// Multer Config for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * Create a new complaint (students only)
 */
router.post('/', authMiddleware, (req, res, next) => {
  console.log('--- POST /complaints ENTRY ---');
  console.log('Headers:', req.headers);
  next();
}, upload.array('images', 3), async (req, res) => {
  try {
    console.log('--- PROCESSING COMPLAINT ---');
    if (!req.user || req.user.role !== 'student') {
      console.log('Unauthorized: Role is', req.user?.role);
      return res.status(403).json({ error: 'Only authenticated students can submit complaints' });
    }

    console.log('Body keys:', Object.keys(req.body));
    console.log('Files received:', req.files?.length || 0);
    if (req.files) {
      req.files.forEach((f, i) => console.log(`File ${i}:`, f.originalname, f.mimetype, f.size));
    }

    // Since we use multipart/form-data, req.body might contain stringified data
    const { title, description, college, location, category, urgency, studentId } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const complaint = new Complaint({
      title,
      description,
      college,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      imageUrls,
      category,
      urgency,
      studentId,
      status: 'Pending',
      createdBy: req.user.id
    });

    console.log('--- SAVING COMPLAINT ---');
    console.log('User ID from token:', req.user.id);
    console.log('Student ID:', studentId);
    if (imageUrls.length > 0) console.log('Images saved:', imageUrls);

    await complaint.save();
    console.log('Successfully saved complaint');
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    console.error('POST /complaints error:', err.stack || err);
    res.status(500).json({ error: 'Failed to submit complaint', details: err.message });
  }
});

/**
 * Get reports by the authenticated student
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can check their own reports' });
    }

    console.log('--- FETCHING MY REPORTS ---');
    console.log('User ID from token:', req.user.id);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found User StudentID:', user.studentId);

    const complaints = await Complaint.find({
      $or: [
        { createdBy: req.user.id },
        ...(user.studentId ? [{ studentId: user.studentId }] : [])
      ]
    })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    console.log(`Found ${complaints.length} reports`);
    res.json(complaints);
  } catch (err) {
    console.error('GET /complaints/my error:', err);
    res.status(500).json({ error: 'Failed to fetch your reports' });
  }
});


/**
 * Get all complaints (superadmin only)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const complaints = await Complaint.find().populate('createdBy', 'fullName email');
    if (complaints.length > 0) {
      console.log('--- SUPERADMIN COMPLAINT FETCH ---');
      console.log('Sample CreatedBy:', complaints[0].createdBy);
    }
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

/**
 * Get complaints by college (admin or superadmin)
 */
router.get('/college/:college', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const complaints = await Complaint.find({ college: req.params.college }).populate('createdBy', 'fullName email');
    if (complaints.length > 0) {
      console.log('--- ADMIN COLLEGE FETCH ---');
      console.log('College:', req.params.college);
      console.log('Sample CreatedBy:', complaints[0].createdBy);
    }
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

/**
 * Update complaint status (admin or superadmin only)
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { status } = req.body;
    complaint.status = status;

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedAt = undefined; // Reset if moving back from Resolved
    }

    await complaint.save();

    // Create Notification for the student
    try {
      const studentId = complaint.createdBy;
      if (studentId) {
        const notification = new Notification({
          recipient: studentId,
          complaint: complaint._id,
          title: 'Report Update',
          message: `Your report "${complaint.title}" is now ${status}.`,
          type: 'status_update'
        });
        await notification.save();
        console.log(`Notification created for user ${studentId} about complaint ${complaint._id}`);
      }
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
      // Don't fail the whole request if notification fails
    }

    res.json({ message: 'Complaint status updated', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

/**
 * Delete a complaint (student owner or admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const logFile = path.join(__dirname, '../server_debug.log');
    const log = (msg) => {
      const timestamp = new Date().toISOString();
      const line = `[${timestamp}] ${msg}\n`;
      console.log(msg);
      fs.appendFileSync(logFile, line);
    };

    log('--- DELETE /complaints/:id ENTRY ---');
    log(`ID: ${req.params.id}`);
    log(`User ID from token: ${req.user.id}`);
    log(`User Role from token: ${req.user.role}`);

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      log('Complaint NOT FOUND');
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Fetch user to get their studentId
    const user = await User.findById(req.user.id);
    if (!user) {
      log('User NOT FOUND');
      return res.status(404).json({ error: 'User not found' });
    }

    // Check ownership: 
    // 1. createdBy matches user.id
    // 2. studentId matches user.studentId (for legacy or alternative identification)
    // Normalize createdBy id whether it's populated or a raw ObjectId/string
    const createdById = complaint.createdBy && (complaint.createdBy._id ? String(complaint.createdBy._id) : String(complaint.createdBy));
    const isOwner = (createdById && createdById === String(req.user.id)) ||
      (complaint.studentId && user.studentId && String(complaint.studentId) === String(user.studentId));

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    log(`Is Owner: ${isOwner}`);
    log(`Is Admin: ${isAdmin}`);
    log(`Complaint CreatedBy: ${complaint.createdBy}`);
    log(`Complaint StudentId: ${complaint.studentId}`);
    log(`User StudentId: ${user.studentId}`);

    if (!isOwner && !isAdmin) {
      log('Unauthorized Delete Attempt');
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }

    // Delete the complaint and return deleted doc for confirmation
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      log('Complaint delete returned null (already removed)');
      return res.status(404).json({ error: 'Complaint not found or already deleted' });
    }

    log('Complaint DELETED SUCCESSFULLY');
    res.json({ message: 'Complaint deleted successfully', complaint: deleted });
  } catch (err) {
    console.error('DELETE /complaints error:', err);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

module.exports = router;

