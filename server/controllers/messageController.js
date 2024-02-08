const Chat = require("../models/chatSchema");
const Message = require("../models/MessageSchema");

//tested and works (used in client)
const createMessage = async (req, res) => {
    const { content, chatId } = req.body;

    try {
        const reqUser = await req.user;
        if (!content || !chatId) {
            console.error('Invalid request: content and chatId are required.');
            return res.status(400).send({ error: "content and chatId required" });
        }
        let newMessage = {
            sender: reqUser.user._id,
            content: content,
            chat: chatId,
            readBy: [reqUser.user._id],  // Add the user ID to the readBy array
        };

        const createdMessage = await Message.create(newMessage);

        // Update the associated chat's latestMessage field
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            { $set: { latestMessage: createdMessage._id } },
            { new: true }
        );


        const fullMessage = await Message.findById(createdMessage._id)
            .populate("sender", "-password")
            .populate("chat");

        return res.status(200).send(fullMessage);
    } catch (error) {
        console.error('Error creating message:', error.message);
        return res.status(400).send(error.message);
    }
};
// (used in client)
const getAllMessages = async (req, res) => {
    try {
        const chatId = req.params.id;
        const reqUser = await req.user;

        let chatExists = await Chat.findById(chatId);

        if (!chatExists) {
            console.log("Chat not found with ID:", chatId);
            return res.status(404).send({ error: "Chat doesn't exist", chatId });
        }

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "-password")
            .populate("chat");


        // Mark messages as read by updating the readBy array
        await Promise.all(messages.map(async (message) => {
            if (!message.readBy.includes(reqUser.user._id)) {
                message.readBy.push(reqUser.user._id);
                await message.save();
            }
        }));

        return res.status(200).send(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).send({ error: error.message });
    }
};

module.exports = { createMessage, getAllMessages };
