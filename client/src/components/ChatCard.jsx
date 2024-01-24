import React from 'react';
import PropTypes from 'prop-types';

const ChatCard = ({ chat, searchUser }) => {
    const { chatName, participants, latestMessage, profilePic } = chat;

    const loggedInUserId = '65ae7a4615f791c138e16891';
    const isGroupChat = chat.isGroupChat || false;
    const receiver = isGroupChat ? null : participants && participants.find(participant => participant._id !== loggedInUserId);

    const receiverName = isGroupChat ? chatName : (receiver ? receiver.name : 'Unknown');

    // Use the searchUser name if it exists
    const displayName = searchUser?.name || receiverName;

    console.log("searcheduser:", searchUser);

    return (
        <div className='flex justify-evenly items-center py-2 group cursor-pointer bg-slate-400 mx-auto'>
            <div className='w-[13%]'>
                {profilePic ? (
                    <img className='h-12 w-12 rounded-full' src={profilePic} alt={displayName} />
                ) : (
                    <img className='h-12 w-12 rounded-full' src={'default-pic-url'} alt={displayName} />
                )}
            </div>
            <div className='w-[80%]'>
                <div className='flex justify-between items-center'>
                    <p className='text-md font-semibold'>
                        {displayName}
                    </p>
                    <p className='text-sm font-semibold'>{latestMessage ? latestMessage.time : ''}</p>
                </div>
                <div className='message'>
                    <p>{latestMessage ? latestMessage.content : 'No messages yet'}</p>
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
            time: PropTypes.string,
            content: PropTypes.string,
        }),
        profilePic: PropTypes.string,
        isGroupChat: PropTypes.bool,
    }).isRequired,
    searchUser: PropTypes.object,
};

export default ChatCard;
