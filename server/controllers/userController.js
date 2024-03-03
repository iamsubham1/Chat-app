const User = require('../models/UserSchema')
const multer = require('multer')
const Chat = require("../models/chatSchema");
const { getPublicID } = require('../utility/getPublicId')
const upload = multer({ dest: 'uploads/' })
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });
const sharp = require('sharp');
const { Readable } = require('stream');
const fs = require("fs");

const cloud_name = process.env.cloud_name;
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;


//cloudinary config
cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret
});



//current user profile info (used in client)
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

//take keyword and search for the user (tested and works) (used in client)
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

        // console.log(searchedUser)

        res.status(200).send(searchedUser);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).send(error.message);
    }
};

//edit user info (used in client)
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

//upload profile picture
const uploadImage = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error('Multer error', err); if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: 'File size exceeds the limit' });
                    }
                    return res.status(500).json({ message: 'Multer error: ' + err.message });
                } else {
                    return res.status(500).json({ message: 'Internal server error: ' + err.message });
                }

            }
            const userId = await req.user.user._id;
            console.log(userId);
            const userData = await User.findById(userId);
            if (!userData) {
                return res.status(404).json({ message: 'User not found' });
            }
            const inputPath = req.file.path;
            if (userData.profilePic) {
                const cloudinaryUrl = userData.profilePic;
                const publicId = await getPublicID(cloudinaryUrl);
                console.log('Existing profile pic found. Public ID:', publicId);

                if (publicId) {
                    try {
                        const deletionResult = await cloudinary.uploader.destroy(publicId);
                        console.log('Existing photo deleted from Cloudinary successfully:', deletionResult);

                    } catch (error) {
                        console.error(`Error deleting existing photo from Cloudinary: ${error}`);

                    }
                }

            } console.log('upload started');

            const transformedImageBuffer = await sharp(inputPath)
                .resize(300, 300)
                .toFormat('jpeg')
                .rotate(0)
                .toBuffer();

            console.log('Image processing complete. Uploading to Cloudinary...');
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (uploadError, result) => {
                if (uploadError) {
                    console.error(`Error uploading to Cloudinary: ${uploadError}`);
                    return res.status(500).json({ message: 'Error uploading photo' });
                }

                console.log('Upload to Cloudinary successful. Updating user profile picture URL...');

                // Update user's profile picture URL in the userSchema
                await User.findOneAndUpdate(
                    userId,
                    { profilePic: result.secure_url }
                );

                console.log('User profile picture URL updated. Responding with success.');

                // Respond with success
                res.status(201).json({ message: 'Photo uploaded successfully' });

                // Delete temporary file after a successful upload
                try {
                    console.log('Deleting temporary file:', inputPath);
                    fs.unlink(inputPath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`Error deleting file: ${unlinkError}`);
                        } else {
                            console.log('Temporary file deleted successfully');
                        }
                    });
                } catch (unlinkError) {
                    console.error(`Error deleting file: ${unlinkError}`);
                }
            });

            // Pipe the transformedImageBuffer directly to the uploadStream
            const transformedImageStream = new Readable();
            transformedImageStream.push(transformedImageBuffer);
            transformedImageStream.push(null);
            transformedImageStream.pipe(uploadStream);
        });





    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error handling photo upload' });
    }
}

//group Pic upload
const uploadGroupPic = async (req, res) => {
    try {


        const chatId = req.body;

        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error('Multer error', err); if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: 'File size exceeds the limit' });
                    }
                    return res.status(500).json({ message: 'Multer error: ' + err.message });
                } else {
                    return res.status(500).json({ message: 'Internal server error: ' + err.message });
                }

            }

            const userId = await req.user.user._id;

            console.log(userId);

            const chatData = await Chat.findById(chatId);
            if (!chatData) {
                return res.status(404).json({ message: 'chat not found' });
            }
            const inputPath = req.file.path;
            if (chatData.groupPic) {
                const cloudinaryUrl = chatData.profilePic;
                const publicId = await getPublicID(cloudinaryUrl);
                console.log('Existing profile pic found. Public ID:', publicId);

                if (publicId) {
                    try {
                        const deletionResult = await cloudinary.uploader.destroy(publicId);
                        console.log('Existing photo deleted from Cloudinary successfully:', deletionResult);

                    } catch (error) {
                        console.error(`Error deleting existing photo from Cloudinary: ${error}`);

                    }
                }

            } console.log('upload started');

            const transformedImageBuffer = await sharp(inputPath)
                .resize(300, 300)
                .toFormat('jpeg')
                .rotate(0)
                .toBuffer();

            console.log('Image processing complete. Uploading to Cloudinary...');
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (uploadError, result) => {
                if (uploadError) {
                    console.error(`Error uploading to Cloudinary: ${uploadError}`);
                    return res.status(500).json({ message: 'Error uploading photo' });
                }

                console.log('Upload to Cloudinary successful. Updating user profile picture URL...');

                // Update user's profile picture URL in the userSchema
                await Chat.findOneAndUpdate(
                    userId,
                    { profilePic: result.secure_url }
                );

                console.log('User profile picture URL updated. Responding with success.');

                // Respond with success
                res.status(201).json({ message: 'Photo uploaded successfully' });

                // Delete temporary file after a successful upload
                try {
                    console.log('Deleting temporary file:', inputPath);
                    fs.unlink(inputPath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`Error deleting file: ${unlinkError}`);
                        } else {
                            console.log('Temporary file deleted successfully');
                        }
                    });
                } catch (unlinkError) {
                    console.error(`Error deleting file: ${unlinkError}`);
                }
            });

            // Pipe the transformedImageBuffer directly to the uploadStream
            const transformedImageStream = new Readable();
            transformedImageStream.push(transformedImageBuffer);
            transformedImageStream.push(null);
            transformedImageStream.pipe(uploadStream);
        });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error handling photo upload' });
    }
}

//upload status 
const uploadVideo = async (req, res) => {
    try {
        upload.single('video')(req, res, async () => {
            const userId = req.user.user._id;
            console.log(userId);

            const userData = await User.findById(userId);
            if (!userData) {
                return res.status(404).json({ message: 'User not found' });
            }

            const inputUrl = req.file.path;

            cloudinary.uploader.upload(inputUrl, { resource_type: 'video' }, async (error, result) => {
                // Always delete the temporary file, whether Cloudinary upload succeeds or not
                fs.unlink(inputUrl, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${err}`);
                    }
                    console.log('Temporary file deleted successfully');
                });

                if (error) {
                    console.error(`Error uploading to Cloudinary: ${error}`);
                    return res.status(500).json({ message: 'Error uploading to Cloudinary' });
                }

                await User.findByIdAndUpdate(
                    userId,
                    { statusVideo: result.secure_url }
                );

                res.status(201).json({ message: 'Video uploaded successfully' });
            });
        });

    } catch (err) {
        console.error('Error in uploadVideo', err);
        return res.status(500).json({ message: 'Internal server error: ' + err.message });
    }
};


module.exports = { currentUserDetails, findUserById, searchUser, editUser, deleteUser, uploadImage, uploadVideo };
