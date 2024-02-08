const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({

    chatName: {
        type: String,
        required: true
    },

    isGroupChat: {
        type: Boolean,
        required: true
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupPic: {
        type: String
    },

}, {
    timestamps: true,
});

const chat = mongoose.model('Chat', chatSchema);
module.exports = chat;