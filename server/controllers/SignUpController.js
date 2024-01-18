const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/UserSchema')

const signUpController = async (req, res) => {
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
            return res.status(200).json({ success: true, msg: "account created" });
        }
        console.log("Account exists Login instead")
        return res.status(400).json({ error: "account exists" })

    } catch (error) {
        console.error(error.message)
        return res.status(500).send('internal Server error ')
    }
}

module.exports = { signUpController };
