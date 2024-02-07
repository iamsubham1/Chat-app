import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { getUserInfoById, chatInfo } from '../apis/api';
import defaultUserImage from '../assets/user.png';

const ChatModalComponent = ({ isOpen, closeModal, selectedChatId, user, token }) => {

    const [chatData, setChatData] = useState('');
    const [receiverData, setReceiverData] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    let receiverId;
    let displayName;

    //get chat details
    const fetchChatDetails = async () => {
        try {
            console.log('Fetching chat details...');
            const data = await chatInfo(token, selectedChatId);
            // console.log('Chat details:', data);
            setChatData(data);
        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    };


    const participants = chatData.participants || [];
    // console.log("participants :", participants)
    //set the id to further fetch info
    if (chatData.isGroupChat) {
        receiverId = null;
        displayName = chatData.chatName || null;
    } else {
        // For one-on-one chat, find the participant other than the active user.
        receiverId = participants.find(participant => participant !== user._id);
        // console.log("receiverId", receiverId, "active user", user._id)
    }

    // console.log(receiverId);

    const receiverDetails = async () => {
        try {
            if (receiverId) {
                // console.log('Fetching receiver details... for', receiverId);
                const userData = await getUserInfoById(token, receiverId);
                // console.log('Receiver details:', userData);
                setReceiverData(userData);
                displayName = receiverData.name
            }
        } catch (error) {
            console.error('Error fetching user details:', error.message);
        }
    };

    const fetchGroupMembersDetails = async () => {
        try {
            // console.log('Fetching group members details...');
            const membersDetails = await Promise.all(participants.map(async member => {
                const userData = await getUserInfoById(token, member);
                return userData;
            }));
            // console.log('Group members details:', membersDetails);
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
    }, [isOpen, receiverId,]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {

                closeModal();
            }}
            className='modal-content w-full h-full flex-col highest grid place-content-center bg bg-[#0f061ab6] modalBg font'
        >

            <button onClick={closeModal} className='bg bg-red-600 absolute right-10 top-10'>Close</button>
            <p>selected chatid: {selectedChatId}</p>
            {/* <p>displayName: </p>
            <img src={""} className='w-12 h-12' /> */}

            <p></p>

            <div id="algn">
                <div id="card">
                    <div id="upper-bg" className='bg-red-600'>
                        <img src={chatData.isGroupChat ? (chatData.groupPic ? chatData.groupPic : defaultUserImage) : receiverData.profilePic ? receiverData.profilePic : defaultUserImage}
                            alt="" className="profile-pic " />
                    </div>
                    <div id="lower-bg">
                        <div className="text">
                            <p className="name capitalize"> {displayName || receiverData.name}</p>
                            <p className="PhoneNumber"></p>
                            <p> {chatData.isGroupChat ? "" : receiverData.about}</p>
                        </div>
                        <div className='groupMembers flex gap-2 justify-center bg mt-5'>
                            {chatData.isGroupChat ? groupMembers.map(member => (
                                <div key={member._id} className=' flex-col-reverse flexprop'>
                                    <p>{member.name}</p>
                                    <img src={member.profilePic || defaultUserImage} className='w-12 max-h-12'></img>
                                </div>
                            )) : ""}
                        </div>


                        {chatData.groupAdmin === user._id ? <div id="btn">
                            <button className="msg text-black" onClick={""}>Edit Group</button>

                        </div> : ""}



                    </div>
                </div>
            </div>
        </Modal>
    );
};
export default ChatModalComponent;