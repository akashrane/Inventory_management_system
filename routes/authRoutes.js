const express = require('express');
const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('../firebase');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Create a new user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Save the user in the MySQL database with their role
        const query = 'INSERT INTO users (user_id, email, role) VALUES (?, ?, ?)';
        global.db.query(query, [userId, email, role], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User registered successfully', userId });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;
