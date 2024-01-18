const express = require('express')
const User = require('../models/UserSchema')
const router = express.Router()

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });


//signup
router.post('/signup', [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', 'Enter a valid email').exists().isEmail(),
    body('number', 'Enter a valid number').isLength({ min: 10, max: 10 }),
    body('password', 'The password must include a digit and should be of atleast 8 digits').isLength({ min: 8 }).matches(/\d/),

], async (req, res) => {
    try {
        //validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => {
                return { msg: `${error.msg}` };
            });
            return res.status(401).json({ error: errorMessages });
        }
        //create account 
        let user = await User.findOne({ $or: [{ email: req.body.email }, { number: req.body.number }] });

        if (!user) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            user = await User.create({
                name: req.body.name,
                password: hashedPassword,
                email: req.body.email,
                number: req.body.number
            })
            res.status(200).json({ success: true, msg: "account created" });
        }
        console.log("Account exists Login instead")
        return res.status(400).json({ error: "account exists" })

    } catch (error) {
        console.error(error.message)
        return res.status(500).send('internal Server error ')
    }
});

//login
router.post('/login', [
    body('number', 'Enter a valid number').isLength(10),
    body('password', 'Password cannot be empty').exists(),
], async (req, res) => {
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
});


module.exports = router
