const mongoose = require('mongoose');
const { schema } = mongoose

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
    number: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },


})

const User = mongoose.model('User', userSchema)
module.exports = User