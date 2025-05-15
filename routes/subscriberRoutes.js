const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber'); // Assuming you have a Subscriber model

// @route POST /api/subscribe
// @desc Subscribe a user
// @access Public

router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        console.log('Subscription request received:', email);
        
        // Check if the email already exists
        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            console.log('Email already subscribed:', email);
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        // Create a new subscriber
        let newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        
        console.log('New subscriber added successfully:', email);
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Error subscribing email:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/subscribers
// @desc Get all subscribers (for admin)
// @access Private (should be protected in production)
router.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        console.error('Error retrieving subscribers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;