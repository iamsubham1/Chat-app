const Chat = require("../models/chatSchema");
const User = require("../models/UserSchema");
const Message = require("../models/MessageSchema");

//tested and works
const createMessage = async (req, res) => {
    const { content, chatId } = req.body;

    try {
        const reqUser = await req.user;

        if (!content || !chatId) {
            return res.status(400).send({ error: "content and chatId required" });
        }

        let newMessage = {
            sender: reqUser.user._id,
            content: content,
            chat: chatId
        };

        const createdMessage = await Message.create(newMessage);

        // Update the associated chat's latestMessage field
        await Chat.findOneAndUpdate(
            { _id: chatId },
            { $set: { latestMessage: createdMessage._id } },
            { new: true }
        );

        const fullMessage = await Message.findById(createdMessage._id)
            .populate("sender", "-password")
            .populate("chat");

        return res.status(200).send(fullMessage);
    } catch (error) {
        console.error(error.message);
        return res.status(400).send(error.message);
    }
};


//tested and works
const getAllMessages = async (req, res) => {
    try {
        const chatId = req.params.id;


        let chatExists = await Chat.findById(chatId);

        if (!chatExists) {
            // console.log("Chat not found with ID:", chatId);
            return res.status(404).send({ error: "Chat doesn't exist", chatId });
        }

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "-password")
            .populate("chat");

        console.log("Messages found:", messages);

        return res.status(200).send(messages);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ error: error.message });
    }
};



module.exports = { createMessage, getAllMessages };
