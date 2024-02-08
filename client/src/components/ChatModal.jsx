import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { getUserInfoById, chatInfo } from '../apis/api';
import defaultUserImage from '../assets/user.png';

const ChatModalComponent = ({ isOpen, closeModal, selectedChatId, user, token, receiverInfo }) => {

    const [chatData, setChatData] = useState('');
    const [receiverData, setReceiverData] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    let individualReceiverId;
    let displayName;

    //get chat details
    const fetchChatDetails = async () => {
        try {
            // console.log('Fetching chat details...');
            const data = await chatInfo(token, selectedChatId);
            // console.log('Chat details:', data);
            setChatData(data);
            receiverInfo(data);

        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    };

    const participants = chatData.participants || [];
    // console.log("participants :", participants)`
    //set the id to further fetch info
    if (chatData.isGroupChat) {
        individualReceiverId = null;


        displayName = chatData.chatName || null;
    } else {
        // For one-on-one chat, find the participant other than the active user.
        individualReceiverId = participants.find(participant => participant !== user._id);
        // console.log("receiverId", receiverId, "active user", user._id)
    }

    // console.log(receiverId);

    const receiverDetails = async () => {
        try {
            if (individualReceiverId) {
                // console.log('Fetching receiver details... for', receiverId);
                const userData = await getUserInfoById(token, individualReceiverId);
                console.log('Receiver details:', userData);
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
            console.log('Group members details:', membersDetails);
            setGroupMembers(membersDetails);
        } catch (error) {
            console.error('Error fetching group members details:', error.message);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchChatDetails();


            // Fetch group members details only if it's a group chat
            if (chatData.isGroupChat) {
                fetchGroupMembersDetails();
            } else {
                // For one-on-one chat, fetch details for the receiver
                receiverDetails();
            }
        }

    }, [isOpen, chatData]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {

                closeModal();
            }}
            className='modal-content w-full h-full flex-col highest grid place-content-center bg bg-[#0f061ab6] modalBg font'
        >

            <button onClick={() => {
                closeModal();

            }} className='bg bg-red-600 absolute right-10 top-10'>Close</button>

            <p></p>

            <div id="algn">
                <div id="card">
                    <div id="upper-bg" className='bg-red-600'>
                        <img src={chatData.isGroupChat ? (chatData.groupPic ? chatData.groupPic : defaultUserImage) : receiverData.profilePic ? receiverData.profilePic : defaultUserImage}
                            alt="" className="profile-pic " />
                    </div>
                    <div id="lower-bg" className='bg-black text-white'>
                        <div className="text">
                            <p className="name capitalize text-xl"> {displayName || receiverData.name}</p>
                            <p className="PhoneNumber mt-5"> {chatData.isGroupChat ? "" : receiverData.phoneNumber}</p>
                            <p className='mt-5 capitalize text-[#9b77fc]' >{chatData.isGroupChat ? "" : "About"}<br /><span className='text-[#ffffff]'>{chatData.isGroupChat ? "" : receiverData.about}</span></p>

                        </div>

                        <div className='groupMembers flex-col gap-4 justify-center'>
                            <p className='text-center -mt-8'>{chatData.isGroupChat && "Members"}</p>
                            <div className='flex justify-evenly mt-2'>{chatData.isGroupChat ? groupMembers.map(member => (
                                <div key={member._id} className=' flex-col-reverse flexprop'>

                                    <p>{member.name}</p>
                                    <img src={member.profilePic || defaultUserImage} className='w-12 max-h-12 rounded-full'></img>
                                </div>
                            )) : ""}</div>

                        </div>


                        {chatData.groupAdmin === user._id ? <div id="btn">
                            <button className="msg text-black" >Edit Group</button>

                        </div> : ""}



                    </div>
                </div>
            </div>
        </Modal>
    );
};
export default ChatModalComponent;