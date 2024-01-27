const express = require('express')
const router = express.Router()
const { body } = require('express-validator');
const { loginController, signUpController } = require('../controllers/authController');

require('dotenv').config({ path: '.env' });


//signup route
router.post('/signup', [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', 'Enter a valid email').exists().isEmail(),
    body('number', 'Enter a valid number').isLength({ min: 10, max: 10 }),
    body('password', 'The password must include a digit and should be of atleast 8 digits').isLength({ min: 8 }).matches(/\d/),

], signUpController);

//login route
router.post('/login', [
    body('password', 'Password cannot be empty').exists(),
], loginController);

module.exports = router
