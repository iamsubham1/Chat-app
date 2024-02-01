const mongoose = require('mongoose');
const { Schema } = mongoose

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    about: {
        type: String,

    },
    password: {
        type: String,
        required: true,
    },

    profilePic: {
        type: String,

    }
})

const User = mongoose.model('User', userSchema)
module.exports = User