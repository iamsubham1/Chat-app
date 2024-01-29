// authController.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");

//signup (tested and works)
const signUpController = async (req, res) => {
    try {
        //validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((error) => {
                return { msg: `${error.msg}` };
            });
            return res.status(401).json({ error: errorMessages });
        }
        //create account
        let user = await User.findOne({
            $or: [{ email: req.body.email }, { number: req.body.number }],
        });

        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                password: hashedPassword,
                email: req.body.email,
                phoneNumber: req.body.number,
            });
            return res.status(200).json({ success: true, msg: "account created" });
        }
        console.log("Account exists Login instead");
        return res.status(400).json({ error: "account exists" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("internal Server error ");
    }
};

//login (tested and works)
const loginController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { number, password, email } = req.body;
        // console.log(req.body)
        let user = await User.findOne({ $or: [{ email: email }, { phoneNumber: number }] });

        if (user) {
            const passwordCompare = await bcrypt.compare(password, user.password);

            if (passwordCompare) {
                const data = { user }

                // console.log(data)
                const JWT = jwt.sign(data, process.env.signature);
                return res.status(200).json({ success: true, JWT });
            }

            console.log("Incorrect credentials");
        } else {
            console.log("Account not found for number");
        }

        return res.status(400).json({ success: false, error: "Enter correct credentials" });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

module.exports = { signUpController, loginController };
