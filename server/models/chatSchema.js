const mongoose = require('mongoose');
const { schema } = mongoose


const chatSchema = new mongoose.Schema({
    chatName: {
        type: String
    },
    isGroupChat: {
        type: Boolean
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

}, {
    timestamps: true,
});

const chat = mongoose.model('Chat', chatSchema);
module.exports = chat;