const User = require('../models/UserSchema')


const currentUserDetails = async (req, res) => {
    try {
        const currentUser = req.user; //got the user.id

        const currentUserDetails = await User.findById(currentUser.id);

        currentUserDetails.password = null;

        return res.status(200).send(currentUserDetails);

    } catch (error) {
        return res.status(400).send(error.message)
    }
}

const findUserById = async (req, res) => {
    try {
        const searchedUser = await User.findById(req.params.id);

        searchedUser.password = null;

        return res.status(200).send(searchUser);


    } catch (error) {
        return res.status(400).send(error.message)

    }
}

const searchUser = async (req, res) => {
    try {
        //pagination
        const page = req.query.page || 1
        const limits = req.query.size || 10
        const skip = (page - 1) * limits
        const keyword = req.query.search ? {
            $or: [

            ]
        }
    } catch (error) {

    }
}