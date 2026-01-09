const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/auth');

const { getSettings, DEFAULT_COLLEGES, DEFAULT_CATEGORIES } = require('../utils/settings');

// Get all settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Manage Colleges
router.post('/colleges', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        const { name } = req.body;
        const settings = await getSettings();
        if (!settings.colleges.includes(name)) {
            settings.colleges.push(name);
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add college' });
    }
});

router.delete('/colleges/:name', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        const settings = await getSettings();
        settings.colleges = settings.colleges.filter(c => c !== req.params.name);
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove college' });
    }
});

// Manage Categories
router.post('/categories', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        const { name } = req.body;
        const settings = await getSettings();
        if (!settings.categories.includes(name)) {
            settings.categories.push(name);
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add category' });
    }
});

router.delete('/categories/:name', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        const settings = await getSettings();
        settings.categories = settings.categories.filter(c => c !== req.params.name);
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove category' });
    }
});

// Danger Zone Actions
router.delete('/danger/clear-resolved', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        await Complaint.deleteMany({ status: 'Resolved' });
        res.json({ message: 'All resolved reports cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear resolved reports' });
    }
});

router.delete('/danger/reset-system', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Unauthorized' });
        // This could mean many things, but usually it involves clearing data
        await Complaint.deleteMany({});
        // Reset categories and colleges to default?
        const settings = await getSettings();
        settings.colleges = DEFAULT_COLLEGES;
        settings.categories = DEFAULT_CATEGORIES;
        await settings.save();
        res.json({ message: 'System reset successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset system' });
    }
});

module.exports = router;
