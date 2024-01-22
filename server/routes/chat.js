const express = require('express')
const router = express.Router()
const { createChat, getAllChats } = require('../controllers/chatController');

const verifyUser = require('../middleware/verifyUser')

router.post('/create', verifyUser, createChat);
router.post('/allchats', verifyUser, getAllChats);






module.exports = router
