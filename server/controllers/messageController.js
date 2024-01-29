const Chat = require("../models/chatSchema");
const Message = require("../models/MessageSchema");

//tested and works
const createMessage = async (req, res) => {
    const { content, chatId } = req.body;

    try {
        const reqUser = await req.user;

        console.log('Received request to create a new message:', req.body);

        if (!content || !chatId) {
            console.error('Invalid request: content and chatId are required.');
            return res.status(400).send({ error: "content and chatId required" });
        }

        console.log('Creating a new message with the following details:', { sender: reqUser.user._id, content, chat: chatId });

        let newMessage = {
            sender: reqUser.user._id,
            content: content,
            chat: chatId
        };

        const createdMessage = await Message.create(newMessage);

        console.log('Message created successfully:', createdMessage);

        // Update the associated chat's latestMessage field
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            { $set: { latestMessage: createdMessage._id } },
            { new: true }
        );

        console.log('Chat updated with the latest message:', updatedChat);

        const fullMessage = await Message.findById(createdMessage._id)
            .populate("sender", "-password")
            .populate("chat");

        console.log('Full message details after population:', fullMessage);

        console.log('Returning the full message as the response.');

        return res.status(200).send(fullMessage);
    } catch (error) {
        console.error('Error creating message:', error.message);
        return res.status(400).send(error.message);
    }
};

const getAllMessages = async (req, res) => {
    try {
        const chatId = req.params.id;

        let chatExists = await Chat.findById(chatId);

        if (!chatExists) {
            console.log("Chat not found with ID:", chatId);
            return res.status(404).send({ error: "Chat doesn't exist", chatId });
        }

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "-password")
            .populate("chat");

        console.log("Messages found:", messages);

        return res.status(200).send(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).send({ error: error.message });
    }
};

module.exports = { createMessage, getAllMessages };
