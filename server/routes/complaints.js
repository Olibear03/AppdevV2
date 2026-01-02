const express = require('express');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const complaint = new Complaint({ ...req.body, createdBy: req.user.id });
    await complaint.save();
    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (err) {
    res.status(400).json({ error: "Failed to submit complaint" });
  }
});

router.get('/', auth, async (req, res) => {
  const complaints = await Complaint.find().populate('createdBy', 'fullName email role');
  res.json(complaints);
});

module.exports = router;
