const express = require('express')
const router = express.Router()
const { getAllMessages, createMessage } = require('../controllers/messageController');
const verifyUser = require('../middleware/verifyUser')


//route to get all messages 
router.get('/getMessages/:id', verifyUser, getAllMessages);

//route to create a message (takes chatid in params)
router.post('/createMessage/:id', verifyUser, createMessage);




module.exports = router
