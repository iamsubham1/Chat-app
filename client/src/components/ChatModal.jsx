import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { getUserInfoById, chatInfo } from '../apis/api';

const ChatModalComponent = ({ isOpen, closeModal, selectedChatId, user, token }) => {
    const [chatData, setChatData] = useState('');
    const [receiverData, setReceiverData] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);

    let receiverId;
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
        console.log(receiverId, activeUserId)
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

    const fetchGroupMembersDetails = async () => {
        try {
            console.log('Fetching group members details...');
            const membersDetails = await Promise.all(participants.map(async member => {
                const userData = await getUserInfoById(token, member);
                return userData;
            }));
            console.log('Group members details:', membersDetails);
            setGroupMembers(membersDetails);
        } catch (error) {
            console.error('Error fetching group members details:', error.message);
        }
    };

    useEffect(() => {
        fetchChatDetails();

        // Fetch group members details only if it's a group chat
        if (chatData.isGroupChat) {
            fetchGroupMembersDetails();
        } else {
            // For one-on-one chat, fetch details for the receiver
            receiverDetails();
        }
    }, [isOpen, receiverId, groupMembers]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className='modal-content w-full h-full flex-col highest grid place-content-center bg bg-[#0f061ab6] modalBg font'
        >
            <h2>Chat Modal</h2>
            <button onClick={closeModal} className='bg bg-red-600 absolute right-10 top-10'>Close</button>
            <p>selected chatid: {selectedChatId}</p>
            <p>displayName: {displayName || receiverData.name}</p>
            <img src={chatData.groupPic || receiverData.profilePic} className='w-12 h-12'></img>
            <p> {chatData.isGroupChat ? "" : receiverData.about}</p>
            <p></p>
            <div className='groupMembers'>
                {chatData.isGroupChat ? groupMembers.map(member => (
                    <div key={member._id}>
                        <p>{member.name}</p>
                        <img src={member.profilePic} className='w-12 h-12 '></img>
                    </div>
                )) : "dsad"}
            </div>
        </Modal>
    );
};
export default ChatModalComponent;