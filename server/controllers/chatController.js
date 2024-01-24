const { default: mongoose } = require("mongoose");
const Chat = require("../models/chatSchema");
const User = require("../models/UserSchema");


//create a chat
const createChat = async (req, res) => {
    try {

        const { userId } = req.body;
        const reqUser = await req.user;
        console.log("Request User ID:", reqUser._id);

        if (!userId) {

            return res.status(400).send({ error: "userId required for chat" });
        }

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { participants: { $elemMatch: { $eq: reqUser._id } } },
                { participants: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("participants", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name profilePic email",
        });

        console.log("Existing Chat:", isChat);

        if (isChat.length > 0) {
            console.log("Chat already exists. Returning existing chat.");
            return res.status(200).send(isChat[0]);
        } else {

            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                participants: [req.user._id, userId],
            };
        }

        const createChat = await Chat.create(chatData);

        const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
            "participants",
            "-password"
        );


        return res.status(200).send(fullChat);
    } catch (error) {
        console.error("Error during createChat:", error.message);
        return res.status(500).send("Internal server error");
    }
};
//get all chats

const getAllChats = async (req, res) => {
    try {
        const reqUser = await req.user;

        const chats = await Chat.find({ participants: reqUser._id })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ timestamps: -1 });


        return res.status(200).send(chats);
    } catch (error) {
        console.log(error.message)
        return res.status(500).send("Internal server error");
    }
};

//create a group
const createGroup = async (req, res) => {
    let { participants, chatName } = req.body;
    const reqUser = await req.user;

    console.log("Before converting to ObjectId, participants =", participants);

    // Convert participants to an array of ObjectId
    participants = participants.map(id => new mongoose.Types.ObjectId());

    console.log("After converting to ObjectId, participants =", participants);

    participants.push(reqUser.user._id);
    participants.push(...participants);

    // Remove duplicate participants(optional)
    participants = Array.from(new Set(participants));

    console.log("Final participants after processing =", participants);

    if (!participants || !chatName) {
        return res.status(400).send({ error: "participants and name field are required" });
    }

    if (participants.length < 2) {
        return res.status(400).send({ error: "add participants" });
    }

    try {
        const createGroup = await Chat.create({ chatName, participants, groupAdmin: reqUser.user._id, isGroupChat: true });

        const fullChat = await Chat.findById(createGroup._id);

        return res.status(200).send(fullChat);
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({ error: "internal server error" });
    }
};


//rename the group name
const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).send({ message: `changed the group name to: ${updatedChat.chatName}` });
    } catch (error) {
        console.log(error.message)
        return res.status(400).send({ error: "internal server error" })
    }
}

//add participants to the group
const addParticipants = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const isChatIdvalid = await Chat.findById(chatId);
        const isUserIdvalid = await User.findById(userId);
        if (!isChatIdvalid || !isUserIdvalid) {
            return res.status(400).send({ error: "chatId or userId invaild" })
        }
        const upadatedGroup = await Chat.findByIdAndUpdate(chatId, { $push: { participants: userId } }, { new: true })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).send({ message: isUserIdvalid.name + " added to the group", group: upadatedGroup })
    } catch (error) {
        console.log(error.message)
        return res.status(400).send({ error: error.message })
    }
}

//remove participants from the group
const removeParticipants = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const isChatIdvalid = await Chat.findById(chatId);
        const isUserIdvalid = await User.findById(userId);
        if (!isChatIdvalid || !isUserIdvalid) {
            return res.status(400).send({ error: "chatId or userId invaild" })
        }
        const upadatedGroup = await Chat.findByIdAndUpdate(chatId, { $pull: { participants: userId } }, { new: true })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).send({ message: isUserIdvalid.name + "removed from the group", group: upadatedGroup })
    } catch (error) {
        console.log(error.message)
        return res.status(400).send({ error: error.message })
    }
}



module.exports = { createChat, getAllChats, createGroup, renameGroup, addParticipants, removeParticipants };
