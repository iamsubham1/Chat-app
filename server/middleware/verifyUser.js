const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env' });

const verifyUser = (req, res, next) => {
    const token = req.header('JWT');

    try {
        const userData = jwt.verify(token, process.env.signature);

        // Convert user _id to ObjectId
        console.log(userData.user._id)
        userData.user._id = new ObjectId(userData.user._id);

        req.user = userData;
        // console.log("decoded data:", userData);
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

module.exports = verifyUser;
