const express = require('express')
const router = express.Router()
const { body } = require('express-validator');
const { loginController } = require('../controllers/loginController');
const { signUpController } = require('../controllers/SignUpController');

require('dotenv').config({ path: '.env' });


//signup
router.post('/signup', [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', 'Enter a valid email').exists().isEmail(),
    body('number', 'Enter a valid number').isLength({ min: 10, max: 10 }),
    body('password', 'The password must include a digit and should be of atleast 8 digits').isLength({ min: 8 }).matches(/\d/),

], signUpController);

//login
router.post('/login', [
    body('number', 'Enter a valid number').isLength(10),
    body('password', 'Password cannot be empty').exists(),
], loginController);

module.exports = router
