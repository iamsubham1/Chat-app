const User = require('../models/UserSchema')

//current user profile info
const currentUserDetails = async (req, res) => {
    try {
        const currentUser = req.user; //got the user info

        const currentUserDetails = await User.findById(currentUser._id);

        currentUserDetails.password = null;

        return res.status(200).send(currentUserDetails);

    } catch (error) {
        return res.status(400).send(error.message)
    }
}

// get info about a user by id
const findUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        user.password = null;

        return res.status(200).send(user);


    } catch (error) {
        return res.status(400).send(error.message)

    }
}

//take keyword and search for the user
const searchUser = async (req, res) => {
    try {
        //pagination
        const page = req.query.page || 1
        const limits = req.query.size || 10
        const skip = (page - 1) * limits
        const keyword = req.query.search ? {
            $or: [
                { name: { regex: req.query.regex, $options: "i" } },
                { phoneNumber: req.query.search }
            ]
        } : {};
        const searchedUser = await User.find(keyword).select("name profilePic").skip(skip).limit(limits)
        return res.status(200).send(searchedUser)
    } catch (error) {
        res.status(400).send(error.message)
    }
}

//edit user info
const editUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })


        return res.status(200).send(updatedUser);


    } catch (error) {
        return res.status(400).send(error.message)

    }
}

//delete account
const deleteUser = async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id)


        return res.status(200).send("msg:account deleted");


    } catch (error) {
        return res.status(400).send(error.message)

    }
}

module.exports = { currentUserDetails, findUserById, searchUser, editUser, deleteUser };
