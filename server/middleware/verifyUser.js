const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const verifyUser = (req, res, next) => {
    const token = req.header('JWT')
    try {
        const decodedData = jwt.verify(token, process.env.signature);
        req.user = decodedData;  //contains all info except password
        console.log(req.user._id)
        next();

    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });

    }
}
module.exports = verifyUser;
