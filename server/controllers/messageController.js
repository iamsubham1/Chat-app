const Chat = require("../models/chatSchema");
const User = require("../models/UserSchema");
const Message = require("../models/MessageSchema");


const createMessage = async (req, res) => {

    const { content, chatId } = req.body;
    try {
        const reqUser = await req.user;
        if (!content || !chatId) {
            return res.status(400).send({ error: "content and chatId required" })
        }
        let newMessage = {
            sender: reqUser._id,
            content: content,
            chat: chatId
        }

        const createdMessage = await Message.create(newMessage);

        const fullMessage = await Message.findById(createdMessage._id)
            .populate("sender", "-password").populate("chat");
        return res.status(200).send(fullMessage)

    } catch (error) {
        return res.status(400).send(error.message)

    }
}

const getAllMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId
        let chatExits = await Chat.findById(chatId)
        if (!chatExits) {
            return res.status(400).send({ error: "chat doesnt exist", chatId })

        }
        const messages = await Message.find(chatId)
            .populate("sender", "-password").populate("chat");
        return res.status(200).send(messages)
    } catch (error) {
        return res.status(400).send(error.message)

    }
}


module.exports = { createMessage, getAllMessages };
