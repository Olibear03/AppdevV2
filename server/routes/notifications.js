const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

/**
 * Get all notifications for the authenticated user
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        console.error('GET /notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * Get unread count
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
        res.json({ count });
    } catch (err) {
        console.error('GET /notifications/unread-count error:', err);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

/**
 * Mark a notification as read
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json({ message: 'Notification marked as read', notification });
    } catch (err) {
        console.error('PUT /notifications/:id/read error:', err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

/**
 * Mark all as read
 */
router.put('/mark-all-read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('PUT /notifications/mark-all-read error:', err);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
