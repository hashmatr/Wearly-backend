const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route: POST /register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generate JWT token
        const payload = {
            user: {
                id: newUser._id,
                role: newUser.role,
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;

                res.status(201).json({
                    newUser: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    },
                    token
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Route: POST /login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Check if the password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Route: GET /profile
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
