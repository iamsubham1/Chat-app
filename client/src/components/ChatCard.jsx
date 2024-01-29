import React from 'react';
import PropTypes from 'prop-types';
import { formatTimestamp } from '../utility/dateAndTime';

const ChatCard = ({ chat, searchUser, user, onSelectChat }) => {
    const { chatName, participants, latestMessage, groupPic, _id } = chat;


    const handleClick = () => {

        onSelectChat(_id); // Pass the chat ID to the parent component
    };



    const loggedInUserId = user._id
    // console.log(userInformation)

    const isGroupChat = chat.isGroupChat;

    // Check who's info to show in card (group or receiver)
    const receiver = isGroupChat ? false : participants && participants.find(participant => participant._id !== loggedInUserId);
    const receiverName = isGroupChat ? chatName : (receiver ? receiver.name : 'Unknown');
    const receiverAvatar = isGroupChat ? groupPic : (receiver ? receiver.profilePic : "");

    // Use the searchUser name if it exists
    const displayName = searchUser?.name || receiverName;
    const displayPic = searchUser?.profilePic || receiverAvatar;

    // Determine the message content to display
    let displayMessage;

    if (searchUser && !latestMessage) {
        displayMessage = "";
    } else {
        displayMessage = latestMessage ? latestMessage.content : 'No messages yet';
    }

    return (
        <div className='flex justify-evenly items-center py-2 group cursor-pointer bg-slate-400 mx-auto' onClick={handleClick}>
            <div className='w-[13%]'>
                {displayPic ? (
                    <img className='h-12 w-12 rounded-full' src={displayPic} alt={displayName} />
                ) : (
                    <img className='h-12 w-12 rounded-full' src={'default-pic-url'} alt={displayName} />
                )}
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
