const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET || 'Akash';
const { v4: uuidv4 } = require('uuid'); 


const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, role: user.role }, // Include the role in the payload
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};


// Register a new user
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if email already exists
        const checkQuery = "SELECT * FROM users WHERE email = ?";
        global.db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: "Email is already registered" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into database
            const insertQuery = `
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `;
            global.db.query(insertQuery, [username, email, hashedPassword, role], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                res.status(201).json({ message: "User registered successfully" });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
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
