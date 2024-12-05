const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require("../middleware/roleMiddleware");


// Fetch all products
router.get('/', verifyToken, (req, res) => {
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


// Update a product
router.put('/:id', (req, res) => {
    const { product_name, description, barcode, quantity, location, supplier_id } = req.body;
    const query = 'UPDATE products SET product_name = ?, description = ?, barcode = ?, quantity = ?, location = ?, supplier_id = ? WHERE product_id = ?';
    global.db.query(query, [product_name, description, barcode, quantity, location, supplier_id, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated successfully' });
    });
});


// Example route: Only 'manager' can add products
router.post("/", verifyToken, verifyRole(["manager"]), (req, res) => {
    const { product_name, description, barcode, quantity, location, supplier_id } = req.body;

    if (!product_name || !description || !barcode || !quantity || !location || !supplier_id) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO products (product_name, description, barcode, quantity, location, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    global.db.query(query, [product_name, description, barcode, quantity, location, supplier_id], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to add product" });
        }
        res.status(201).json({ message: "Product added successfully" });
    });
});

// Example route: Only 'manager' can delete products
router.delete("/:id", verifyToken, verifyRole(["manager"]), (req, res) => {
    const productId = req.params.id;

    const query = "DELETE FROM products WHERE product_id = ?";
    global.db.query(query, [productId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to delete product" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    });
});

module.exports = router;
