import { useEffect, useState } from 'react';
import React from 'react';
import Modal from 'react-modal';
import defaultUserImage from '../assets/user.png';
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { MdEdit } from "react-icons/md";

import {
    searchUsers,
    getUserInfoById,
} from '../apis/api';

const EditGroupModal = ({ isOpen, closeModal, selectedChatId, token, chatData, groupMembers, reloadInfoAfteredit }) => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState([]);
    const [editedChatName, setEditedChatName] = useState(chatData.chatName);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const handleSearchInputChange = (e) => {
        setKeyword(e.target.value);
    };

    const performSearch = async () => {
        try {
            const data = await searchUsers(token, keyword);
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const userSelection = async (userId) => {
        try {
            const userDetails = await getUserInfoById(token, userId);
            setSelectedUserIds((prevIds) => !prevIds.includes(userId) ? [...prevIds, userId] : prevIds);
            setSelectedUserDetails((prevDetails) => {
                const userDetailsExist = prevDetails.some(userDetail => userDetail._id === userDetails._id);
                return !userDetailsExist ? [...prevDetails, userDetails] : prevDetails;
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
            });
            if (!response.ok) throw new Error('Network response was not ok');
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
            });
            if (!response.ok) throw new Error('Network response was not ok');
            reloadInfoAfteredit();
            alert("Selected member deleted");
        } catch (error) {
            console.error('Error editing group:', error.message);
        }
    }

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async (editedChatName) => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/renameGroup', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                },
                body: JSON.stringify({
                    chatName: editedChatName,
                    chatId: selectedChatId,
                }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            reloadInfoAfteredit();
            alert("Group name updated");
        } catch (error) {
            console.error('Error editing group:', error.message);
        }
        setIsEditing(false);
    };

    useEffect(() => {
        if (keyword.trim() !== '') {
            performSearch(keyword);
        } else {
            setSearchResults([]);
        }
    }, [keyword]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className='modal-content w-full h-full max-w-lg max-h-[90vh] overflow-auto flex flex-col items-center justify-center font'
            overlayClassName="overlay">
            <div className='w-full bg-black text-white p-5 flex-col rounded'>
                <h1 className='text-center text-xl md:text-2xl'>Edit group</h1>
                <div className='main-section grid'>
                    <div className='GroupNameSection text-center capitalize text-[#A47FCC]'>
                        {isEditing ? (
                            <div className='flex justify-center p-2 gap-4'>
                                <input
                                    type="text"
                                    value={editedChatName}
                                    placeholder="Group Name"
                                    onChange={(e) => setEditedChatName(e.target.value)}
                                    className='px-3 rounded-md border-2 bg-transparent text-white focus:bg-transparent py-1'
                                />
                                <button onClick={() => handleSaveClick(editedChatName)} className='text-black bg-white hover:text-white hover:bg-[#22C55E] rounded px-2 py-1'>Save</button>
                            </div>
                        ) : (
                            <div className='flex justify-center p-2 gap-1 prop text-2xl'>
                                {chatData.chatName}
                                <MdEdit onClick={handleEditClick} className='hover:text-white hover:cursor-pointer text-[#4d4d4d]' />
                            </div>
                        )}
                    </div>

                    <div className='groupMembers flex-col justify-center bg-[#22222257] mt-5'>
                        <div className='flex justify-evenly mt-2 flex-wrap'>
                            {chatData.isGroupChat && groupMembers.map(member => (
                                <div key={member._id} className='flex-col-reverse flexprop'>
                                    <button onClick={() => handleDeleteMember(member._id)}>
                                        <IoClose className="text-[#ff6262] text-2xl hover:text-[red]" />
                                    </button>
                                    <p className='text-white capitalize'>{member.name}</p>
                                    <img src={member.profilePic || defaultUserImage} className='w-12 max-h-12 rounded-full' alt={member.name}></img>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='searchSection w-full m-auto mt-5 flex flex-col items-center'>
                        <div className='searchBar w-4/5 flex gap-5'>
                            <input
                                className="w-3/4 py-1 px-3 rounded-md border-2 bg-transparent text-white focus:bg-transparent"
                                type="input"
                                placeholder="Search user"
                                onChange={handleSearchInputChange}
                                value={keyword}
                            />
                            <button onClick={addParticipants} className='text-black bg-white w-1/4 m-auto hover:text-white hover:bg-[#22C55E] rounded py-1'>Add</button>
                        </div>

                        {searchResults.map((user) => (
                            <div key={user._id} className="user-card rounded-md flex m-1 py-2 px-3 gap-3 mt-5 w-full bg-[#48484856] prop cursor-pointer text-white items-start hover:text-black hover:bg-[#9678FF]" onClick={() => userSelection(user._id)}>
                                <img
                                    src={user && user.profilePic ? user.profilePic : defaultUserImage}
                                    alt={user.name}
                                    className="w-12 h-12 object-contain rounded-full border-2"
                                />
                                <p className="font-semibold capitalize">{user.name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="selected-users mt-6 flex space-x-3 justify-center py-2 flex-wrap">
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
                    </div>
                </div>

                <button onClick={closeModal} className='absolute right-10 top-10'>
                    <IoClose className="text-[#f74545] text-4xl hover:text-[red]" />
                </button>
            </div>
        </Modal>
    );
};

export default EditGroupModal;
