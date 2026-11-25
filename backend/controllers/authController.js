const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'sportzone_jwt_secret_key_2026';

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        const trimmedUser = username.trim();
        const trimmedEmail = email.trim().toLowerCase();

        // Check if username or email already exists in MySQL
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
            [trimmedEmail, trimmedUser]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email is already registered.' });
        }

        // Hash password securely with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store user credential in database
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [trimmedUser, trimmedEmail, hashedPassword]
        );

        return res.status(201).json({
            message: 'Account registered successfully! You can now log in.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Failed to register user. Please try again.' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginId = (identifier || email || '').trim();

        if (!loginId || !password) {
            return res.status(400).json({ error: 'Please provide your email/username and password.' });
        }

        // Search user by email or username
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
            [loginId.toLowerCase(), loginId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials. User not found.' });
        }

        const user = rows[0];

        // Compare password against stored hash in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
        }

        // Issue JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful! Welcome back.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error during login. Please try again.' });
    }
};

// Get Current User Profile (Protected)
exports.getMe = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ? LIMIT 1',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        return res.status(200).json({ user: rows[0] });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        return res.status(500).json({ error: 'Failed to retrieve profile data.' });
    }
};
