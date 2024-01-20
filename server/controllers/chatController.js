const Chat = require("../models/chatSchema");
const User = require("../models/UserSchema");

const createChat = async (req, res) => {
    try {
        const { userId } = req.body;
        const reqUser = await req.user;
        if (!userId) {
            return res.status(400).send({ error: "userId required for chat" });
        }
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { participants: { $eleMatch: { $eq: reqUser.id } } },
                { participants: { $eleMatch: { $eq: userId } } },
            ],
        })
            .populate("participants", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name profilePic email",
        });
        if (isChat.length > 0) {
            return res.status(200).send(isChat[0]);
        } else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                participants: [req.user.id, userId],
            };
        }
        const createChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ id: createChat.id }).populate(
            "participants",
            "-password"
        );

        return res.status(200).send(fullChat);
    } catch (error) {
        return res.status(500).send("interal server error");
    }
};
