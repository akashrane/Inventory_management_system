const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET || 'Akash';
const { v4: uuidv4 } = require('uuid'); 


// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Generate a unique ID for user_id
        const userId = uuidv4();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const query = 'INSERT INTO users (user_id, username, email, password, role) VALUES (?, ?, ?, ?, ?)';
        global.db.query(query, [userId, username, email, hashedPassword, role], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User registered successfully', userId });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from database
        const query = 'SELECT * FROM users WHERE email = ?';
        global.db.query(query, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'User not found' });

            const user = results[0];

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

            // Generate a JWT token
            const token = jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
