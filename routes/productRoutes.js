const express = require('express');
const router = express.Router();

// Fetch all products
router.get('/', (req, res) => {
    const query = 'SELECT * FROM products';
    global.db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get a specific product by ID
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM products WHERE product_id = ?';
    global.db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(results[0]);
    });
});

// Add a new product
router.post('/', (req, res) => {
    const { product_name, description, barcode, quantity, location, supplier_id } = req.body;
    const query = 'INSERT INTO products (product_name, description, barcode, quantity, location, supplier_id) VALUES (?, ?, ?, ?, ?, ?)';
    global.db.query(query, [product_name, description, barcode, quantity, location, supplier_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Product added successfully' });
    });
});

// Update a product
router.put('/:id', (req, res) => {
    const { product_name, description, barcode, quantity, location, supplier_id } = req.body;
    const query = 'UPDATE products SET product_name = ?, description = ?, barcode = ?, quantity = ?, location = ?, supplier_id = ? WHERE product_id = ?';
    global.db.query(query, [product_name, description, barcode, quantity, location, supplier_id, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated successfully' });
    });
});

// Delete a product
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM products WHERE product_id = ?';
    global.db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;
