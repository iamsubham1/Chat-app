const express = require('express')
const router = express.Router()
const { createChat, getAllChats, createGroup, renameGroup, addParticipants, removeParticipants, deleteChat, chatinfo } = require('../controllers/chatController');

const verifyUser = require('../middleware/verifyUser')

//start a chat 
router.post('/create', verifyUser, createChat);

router.delete('/deleteChat/:id', verifyUser, deleteChat)

//get all chats
router.get('/allchats', verifyUser, getAllChats);

//get chat info by id 
router.get('/chatInfo/:id', verifyUser, chatinfo);
//create a group
router.post('/createGroup', verifyUser, createGroup);

//rename the group name
router.put('/renameGroup', verifyUser, renameGroup);

//add participants to the group
router.post('/addParticipants', verifyUser, addParticipants);

//remove participants from the group
router.delete('/removeParticipants', verifyUser, removeParticipants);





module.exports = router
