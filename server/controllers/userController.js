const User = require('../models/UserSchema')

//current user profile info
const currentUserDetails = async (req, res) => {
    try {
        const currentUser = req.user; //got the user info

        const currentUserDetails = await User.findById(currentUser.user._id);

        currentUserDetails.password = null;
        // console.log(currentUserDetails)
        return res.status(200).send(currentUserDetails);

    } catch (error) {
        return res.status(400).send(error.message)
    }
}

// get info about a user by id (tested and works)
const findUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        user.password = null;

        return res.status(200).send(user);


    } catch (error) {
        return res.status(400).send(error.message)

    }
}

//take keyword and search for the user (tested and works)
const searchUser = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limits = req.query.size || 10;
        const skip = (page - 1) * limits;

        const isNumeric = !isNaN(parseFloat(req.query.search)) && isFinite(req.query.search);

        const keyword = isNumeric
            ? { phoneNumber: req.query.search }
            : req.query.regex
                ? { name: { $regex: new RegExp(req.query.regex, 'i') } }
                : { name: req.query.search };

        const searchedUser = await User.find(keyword).select("name profilePic").skip(skip).limit(limits);



        res.status(200).send(searchedUser);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).send(error.message);
    }
};

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
