// authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema')

const loginController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { number, password } = req.body;
        let user = await User.findOne({ number: number });

        if (user) {
            const passwordCompare = await bcrypt.compare(password, user.password);

            if (passwordCompare) {
                const data = { user: { id: user.id } };
                const JWT = jwt.sign(data, process.env.signature);
                return res.status(200).json({ success: true, JWT });
            }

            console.log('Incorrect credentials');
        } else {
            console.log('Account not found for number');
        }

        return res.status(400).json({ success: false, error: "Enter correct credentials" });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { loginController };
