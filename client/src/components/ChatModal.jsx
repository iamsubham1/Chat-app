import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { getUserInfoById, chatInfo } from '../apis/api';

// ... (other imports)

const ChatModalComponent = ({ isOpen, closeModal, selectedChatId, user, token }) => {
    const [chatData, setChatData] = useState('');
    const [receiverData, setReceiverData] = useState('');
    let receiverId; // Declare receiver
    let displayName;

    //get chat details
    const fetchChatDetails = async () => {
        try {
            console.log('Fetching chat details...');
            const data = await chatInfo(token, selectedChatId);
            console.log('Chat details:', data);
            setChatData(data);
        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    };

    const activeUserId = user._id;
    const participants = chatData.participants || [];

    //set the id to further fetch info
    if (chatData.isGroupChat) {
        receiverId = null;
        displayName = chatData.chatName || null;
    } else {
        // For one-on-one chat, find the participant other than the active user.
        receiverId = participants.find(participant => participant._id !== activeUserId) || null;
    }

    console.log(receiverId);

    const receiverDetails = async () => {
        try {
            if (receiverId) {
                console.log('Fetching receiver details... for', receiverId);
                const userData = await getUserInfoById(token, receiverId);
                console.log('Receiver details:', userData);
                setReceiverData(userData);
            }
        } catch (error) {
            console.error('Error fetching user details:', error.message);
        }
    };

    useEffect(() => {
        fetchChatDetails();
        receiverDetails();
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className='modal-content w-full h-full flex-col highest grid place-content-center bg bg-[#0f061ab6] modalBg font'
        >
            <h2>Chat Modal</h2>
            <button onClick={closeModal}>Close</button>
            <p>selected chatid: {selectedChatId}</p>
            <p>displayName: {displayName || receiverData.name}</p>
            <div className='groupMembers'>
                {chatData.isGroupChat && participants.map(member => (
                    <div key={member._id}>
                        <p>{member}</p>
                        {/* Add more details as needed */}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default ChatModalComponent;


