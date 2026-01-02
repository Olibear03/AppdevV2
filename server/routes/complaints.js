const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/auth');

/**
 * Create a new complaint (students only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only authenticated students can submit complaints' });
    }

    const { title, description, college, location, imageUrl, category, urgency, studentId } = req.body;

    const complaint = new Complaint({
      title,
      description,
      college,
      location,
      imageUrl,
      category,   // ✅ save
      urgency,    // ✅ save
      studentId,  // ✅ save
      status: 'pending',
      createdBy: req.user.id
    });

    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    console.error('POST /complaints error:', err.stack || err);
    res.status(500).json({ error: 'Failed to submit complaint', details: err.message });
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
    const complaints = await Complaint.find().populate('createdBy');
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
    const complaints = await Complaint.find({ college: req.params.college }).populate('createdBy');
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

    complaint.status = req.body.status;
    await complaint.save();

    res.json({ message: 'Complaint status updated', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

module.exports = router;
