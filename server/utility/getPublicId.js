
const getPublicID = async (url) => {


    const publicId = url.split('/').pop().split('.')[0];
    return (publicId);


};

module.exports = {
    getPublicID
};