// authController.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EmailPassword
    },
});

//signup (tested and works) (used in client)
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

//login (tested and works) (used in client)
const loginController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { password, email } = req.body;
        // console.log(req.body)
        let user = await User.findOne({ email: email });

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

// forgotPassword
const verifyEmail = async (req, res) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(200).json({ message: true });
        return;
    }
    res.status(404).json({ message: false });
};


const passwordChange = async (req, res) => {
    try {
        const { email, password } = req.body;
        const updatePassword = await User.updateOne({ email }, { password });
        if (updatePassword) {
            res.status(200).json({ message: "Password changed successfully" });
        } else {
            res.status(404).json({ message: "Password not changed" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error changing Password" });
    }
};


const sendOtpEmail = async (req, res) => {
    // Generate OTP
    const otp = otpGenerator.generate(4, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
    });
    const mailOptions = {
        from: `NetTeam Support <${process.env.EMAIL}>`,
        to: email,
        subject: "Email Verification",
        text: `Your OTP is: ${otp}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error:", error);
            res
                .status(500)
                .json({ error: "An error occurred while sending the email" });
        } else {
            console.log("Email sent:", info.response);
            res.status(200).json(otp);
        }
    });

}



//forgetPassword
module.exports = { signUpController, loginController, verifyEmail, passwordChange };