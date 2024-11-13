const express = require('express');
const router = express.Router();

// Fetch all notifications
router.get('/', (req, res) => {
    const query = 'SELECT * FROM notifications ORDER BY timestamp DESC';
    global.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Fetch unseen notifications
router.get('/unseen', (req, res) => {
    const query = 'SELECT * FROM notifications WHERE seen = FALSE';
    global.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Mark a notification as seen
router.put('/seen/:id', (req, res) => {
    const query = 'UPDATE notifications SET seen = TRUE WHERE notification_id = ?';
    global.db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Notification marked as seen' });
    });
});

// Create a new notification
router.post('/', (req, res) => {
    const { product_id, message } = req.body;
    const query = 'INSERT INTO notifications (product_id, message) VALUES (?, ?)';
    global.db.query(query, [product_id, message], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Notification created successfully' });
    });
});

module.exports = router;
