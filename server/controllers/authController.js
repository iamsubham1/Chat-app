// authController.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const nodemailer = require("nodemailer");
const { generateUniqueOTP
} = require("../utility/generateOTP");

require('dotenv').config();

var otp;
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {

        user: process.env.EMAIL,
        pass: process.env.PASSWORD
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
    otp = generateUniqueOTP(); // Assuming generateOTP is a function that generates OTP
    const { email } = req.body;

    const mailOptions = {
        from: `.Connect_support <${process.env.EMAIL}>`,
        to: email,
        subject: "Email Verification",
        html: `
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
              <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #eee">
                  <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Connect Messaging app</a>
                </div>
                <p style="font-size: 1.1em">Hi,</p>
                <p>Thank you for choosing Connect Messaging app. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
                <p style="font-size: 0.9em;">Regards,<br />Connect Messaging app</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>Connect Messaging app LTD</p>
                  <p>Odisha</p>
                  <p>India</p>
                </div>
              </div>
            </div>
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error:", error);
            res.status(500).json({ error: "An error occurred while sending the email" });


        } else {
            console.log("Email sent:", info.response);
            res.status(200).json("OTP SENT Successfully");
            sentotp = otp;
            console.log(sentotp);
        }
    });
}


const verifyOtp = async (req, res) => {
    const { receivedOtp } = req.body;
    console.log(receivedOtp, otp);
    if (receivedOtp == otp) {
        res.status(200).json("yes it works");
    } else {
        res.status(400).json("no it doesnt work");
    }
}


//forgetPassword
module.exports = { signUpController, loginController, verifyEmail, passwordChange, sendOtpEmail, verifyOtp };