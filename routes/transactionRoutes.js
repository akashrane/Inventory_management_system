const express = require('express');
const router = express.Router();

// Fetch all transactions
router.get('/', (req, res) => {
    const query = 'SELECT * FROM transactions';
    global.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get a specific transaction by ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM transactions WHERE transaction_id = ?';
    global.db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Transaction not found' });
        res.json(results[0]);
    });
});

// Add a new transaction
router.post('/', (req, res) => {
    const { product_id, user_id, change_type, quantity, notes } = req.body;
    const query = 'INSERT INTO transactions (product_id, user_id, change_type, quantity, notes) VALUES (?, ?, ?, ?, ?)';
    global.db.query(query, [product_id, user_id, change_type, quantity, notes], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Transaction recorded successfully' });
    });
});

// Delete a transaction
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM transactions WHERE transaction_id = ?';
    global.db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Transaction deleted successfully' });
    });
});

module.exports = router;
