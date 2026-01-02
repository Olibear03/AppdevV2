const express = require('express');
const multer = require('multer');
const Complaint = require('../models/Complaint');

const router = express.Router();

// Store uploads in server/uploads
const upload = multer({ dest: 'server/uploads/' });

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { studentId, description, category, urgency, college, location } = req.body;

    const complaint = new Complaint({
      studentId,
      description,
      category,
      urgency,
      college,
      location: location ? JSON.parse(location) : null,
      photo: req.file ? req.file.path : null,
      status: 'Pending',
    });

    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('List complaints error:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

module.exports = router;
