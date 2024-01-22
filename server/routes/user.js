const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser')
const { currentUserDetails, findUserById, searchUser, editUser, deleteUser } = require('../controllers/userController')

router.get('/profile', verifyUser, currentUserDetails);
router.get('/find:id', verifyUser, findUserById);
router.get('/search', verifyUser, searchUser);
router.put('/edit/:id', verifyUser, editUser);
router.delete('/delete/:id', verifyUser, deleteUser)


module.exports = router
