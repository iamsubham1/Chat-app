import React from 'react';
import PropTypes from 'prop-types';
import { formatTimestamp } from '../utility/dateAndTime';
import defaultUserImage from '../assets/user.png';

const ChatCard = ({ chat, searchUser, user, onSelectChat }) => {

    const { chatName, participants, latestMessage, groupPic, _id } = chat;

    if (searchUser) {
        console.log("searched user id is :", searchUser._id)
    }
    const handleClick = () => {
        onSelectChat(_id, searchUser);
    };

    const loggedInUserId = user._id;
    const isGroupChat = chat.isGroupChat;

    // Check who's info to show in card (group or receiver)
    const receiver = isGroupChat ? false : participants && participants.find(participant => participant._id !== loggedInUserId);
    const receiverName = isGroupChat ? chatName : (receiver ? receiver.name : 'Unknown');
    const receiverAvatar = isGroupChat ? groupPic : (receiver ? receiver.profilePic : "");

    // Use the searchUser name if it exists
    const displayName = searchUser?.name || receiverName;
    const displayPic = searchUser?.profilePic || receiverAvatar;

    let displayMessage;

    if (searchUser && !latestMessage) {
        displayMessage = "";
    } else {
        displayMessage = latestMessage ? latestMessage.content : 'No messages yet';
    }

    return (
        <div className='flex justify-evenly items-center py-2 group cursor-pointer bg-[#121218]  hover:bg-[#7a48b788] mx-auto text-white' onClick={handleClick}>
            <div className='w-[13%]'>
                <img className='h-12 w-12 rounded-full' src={displayPic || defaultUserImage} alt={displayName} />

            </div>
            <div className='w-[80%]'>
                <div className='flex justify-between items-center'>
                    <p className='text-md font-semibold capitalize'>
                        {displayName}
                    </p>
                    <p className='text-sm font-semibold '>
                        {latestMessage ? formatTimestamp(latestMessage.createdAt) : ''}
                    </p>
                </div>
                <div className='message'>
                    <p>{displayMessage}</p>
                </div>
            </div>
        </div>
    );
};

ChatCard.propTypes = {
    chat: PropTypes.shape({
        chatName: PropTypes.string,
        participants: PropTypes.arrayOf(PropTypes.object),
        latestMessage: PropTypes.shape({
            createdAt: PropTypes.string,
            content: PropTypes.string,
        }),
        groupPic: PropTypes.string,
        isGroupChat: PropTypes.bool,
    }).isRequired,
    searchUser: PropTypes.object,
    onSelectChat: PropTypes.func.isRequired,
};

export default ChatCard;
