import { useEffect, useState } from 'react';
import React from 'react'
import Modal from 'react-modal';
import defaultUserImage from '../assets/user.png';
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';


import {
    searchUsers,
    getUserInfoById,

} from '../apis/api';

const EditGroupModal = ({ isOpen, closeModal, selectedChatId, token, chatData, groupMembers, reloadInfoAfteredit }) => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState([]);
    const [deleteParticipantsid, setDeleteParticipantsid] = useState([]);
    const navigate = useNavigate();

    const handleSearchInputChange = (e) => {
        setKeyword(e.target.value);
        console.log(e.target.value)
    };

    const performSearch = async () => {
        try {
            const data = await searchUsers(token, keyword);
            setSearchResults(data);
            // console.log(searchResults)

        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const userSelection = async (userId) => {
        try {
            const userDetails = await getUserInfoById(token, userId);

            setSelectedUserIds((prevIds) => {
                if (!prevIds.includes(userId)) {
                    const updatedIds = [...prevIds, userId];
                    return updatedIds;
                }
                return prevIds;
            });

            setSelectedUserDetails((prevDetails) => {
                const userDetailsExist = prevDetails.some(
                    (userDetail) => userDetail._id === userDetails._id
                );

                if (!userDetailsExist) {
                    const updatedDetails = [...prevDetails, userDetails];
                    return updatedDetails;
                }

                return prevDetails;

            });

            setKeyword('');
        } catch (error) {
            console.error('Error adding user to selection:', error.message);
        }
    };

    const removeSelectedUser = (userId) => {
        setSelectedUserIds((prevIds) => prevIds.filter((id) => id !== userId));
        setSelectedUserDetails((prevDetails) => prevDetails.filter((user) => user._id !== userId));
    };

    const addParticipants = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/addparticipants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                },
                body: JSON.stringify({
                    userId: selectedUserIds,
                    chatId: selectedChatId,
                }),
            })
            if (!response.ok) {
                console.error('Network response was not ok');
                throw new Error('Network response was not ok');
            }
            reloadInfoAfteredit();

            alert("Participants added");

            setSelectedUserIds([]);
            setSelectedUserDetails([]);

        } catch (error) {
            console.error('Error editing group:', error.message);
        }
    }


    const handleDeleteMember = async (memberid) => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/removeParticipants', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                },
                body: JSON.stringify({
                    userId: memberid,
                    chatId: selectedChatId,
                }),

            })
            if (!response.ok) {
                console.error('Network response was not ok');
                throw new Error('Network response was not ok');
            }
            reloadInfoAfteredit();
            alert("selected member deleted");
        } catch (error) {
            console.error('Error editing group:', error.message);
        }
    }


    useEffect(() => {
        performSearch();
    }, [keyword]);



    return (

        <Modal
            isOpen={isOpen}
            onRequestClose={() => {

                closeModal();


            }} className='modal-content w-full h-full flex-col highest grid place-content-center font '
            overlayClassName="overlay"
        >



            <div className='w-full h-full flex-col flexprop'>
                <h1 className='text-center -2'>edit group</h1>
                <div className='main-sec w-[50vw] h-[50vh] bg-[#000000f6] px-4' >
                    {selectedChatId}




                    <h1 className='text-white text-center'> {chatData.chatName}</h1>

                    <div className='groupMembers flex-col gap-4 justify-center'>
                        <p className='text-center -mt-8'>{chatData.isGroupChat && "Members"}</p>
                        <div className='flex justify-evenly mt-2'>{chatData.isGroupChat ? groupMembers.map(member => (
                            <div key={member._id} className=' flex-col-reverse flexprop'>
                                <button onClick={() => handleDeleteMember(member._id)}>

                                    <IoClose className="text-[#ff6262] text-2xl hover:text-[red]" />
                                </button>
                                <p className='text-white'>{member.name}</p>
                                {member._id}
                                <img src={member.profilePic || defaultUserImage} className='w-12 max-h-12 rounded-full'></img>

                            </div>

                        )) : ""}
                        </div>

                    </div>


                    <input
                        className="w-[90%] py-2 px-3 rounded-md border-2 bg-transparent text-white focus:bg-transparent"
                        type="input"
                        placeholder="Search user"
                        onChange={handleSearchInputChange}
                        value={keyword}
                    />

                    {searchResults.map((user) => (
                        <div key={user._id} className="user-card rounded-md flex m-1 py-2 px-3 gap-3 bg-[#48484856] prop cursor-pointer text-white items-start hover:text-black hover:bg-[#9678FF]" onClick={() => userSelection(user._id)}>
                            <img
                                src={user && user.profilePic ? user.profilePic : defaultUserImage}
                                alt={user.name}
                                className="w-12 h-12 object-contain rounded-full border-2"
                            />
                            <p className="font-semibold capitalize">{user.name}</p>
                        </div>
                    ))}


                    <div className="selected-users mt-6 flex space-x-3 ">
                        {selectedUserDetails.map((user) => (
                            <div key={user._id} className="text-white flex-col flexprop">
                                <img
                                    src={user.profilePic || defaultUserImage}
                                    alt={user.name}
                                    className="w-10 h-10 object-contain mb-2 rounded-full border-2"
                                />
                                <button onClick={() => removeSelectedUser(user._id)}>
                                    <IoClose className="text-[#ff6262] text-2xl hover:text-[red]" />
                                </button>
                            </div>
                        ))}

                        <button onClick={addParticipants} className='text-white'>add</button>

                    </div>


                </div>
















                <button onClick={() => {
                    closeModal();

                }} className='bg bg-red-600 absolute right-10 top-10'>Close</button>
            </div>

        </Modal>
    )
}

export default EditGroupModal
