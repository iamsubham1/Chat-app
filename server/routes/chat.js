const express = require('express')
const router = express.Router()
const { createChat, getAllChats, createGroup, renameGroup, addParticipants, removeParticipants } = require('../controllers/chatController');

const verifyUser = require('../middleware/verifyUser')

//start a chat
router.post('/create', verifyUser, createChat);

//get all chats
router.get('/allchats', verifyUser, getAllChats);

//create a group
router.post('/createGroup', verifyUser, createGroup);

//rename the group name
router.put('/renameGroup', verifyUser, renameGroup);

//add participants to the group
router.post('/addParticipants', verifyUser, addParticipants);

//remove participants from the group
router.delete('/removeParticipants', verifyUser, removeParticipants);





module.exports = router
