const express = require('express')
const router = express.Router();
const verifyUser = require('../middleware/verifyUser')
const { currentUserDetails, findUserById, searchUser, editUser, deleteUser, uploadImage, uploadVideo, uploadGroupPic } = require('../controllers/userController')


//current user profile route
router.get('/profile', verifyUser, currentUserDetails);

//find a user by id
router.get('/find/:id', verifyUser, findUserById);

//search user by keyword
router.get('/search', verifyUser, searchUser);

//edit user info
router.put('/edit/:id', verifyUser, editUser);

//delete account
router.delete('/delete/:id', verifyUser, deleteUser);

//upload profile image
router.post('/uploadImg', verifyUser, uploadImage);

//upload group pic
router.post('/uploadGroupPic/:id', verifyUser, uploadGroupPic);

router.post('/uploadVideo', verifyUser, uploadVideo);


module.exports = router
