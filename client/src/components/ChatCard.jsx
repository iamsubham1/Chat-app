import React from 'react';
import PropTypes from 'prop-types';

const ChatCard = ({ user }) => {
    const { name, profilePic, lastMessage } = user;
    return (
        <div className='flex justify-evenly items-center py-2 group cursor-pointer bg-slate-400 mx-auto'>
            <div className='w-[13%]'>
                <img className='h-12 w-12 rounded-full' src={profilePic || user} alt={name} />
            </div>
            <div className='w-[80%]'>
                <div className='flex justify-between items-center'>
                    <p className='text-md font-semibold'>{name}</p>
                    <p className='text-sm font-semibold'>{lastMessage ? lastMessage.time : ''}</p>
                </div>
                <div className='message'>
                    <p>{lastMessage ? lastMessage.content : 'No messages yet'}</p>
                </div>
            </div>
        </div>
    );
};

ChatCard.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        profilePic: PropTypes.string,
        lastMessage: PropTypes.shape({
            time: PropTypes.string,
            content: PropTypes.string,
        }),
    }).isRequired,
};

export default ChatCard;

