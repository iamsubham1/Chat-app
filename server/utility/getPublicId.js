const cloudinary = require('cloudinary').v2;

const getPublicID = async (url) => {


    const publicId = url.split('/').pop().split('.')[0];
    return (publicId);
    console.log(publicId)


};

module.exports = {
    getPublicID
};