import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getCookie } from '@/utility/getcookie';
import { IoClose } from "react-icons/io5";

import {
    searchUsers,
    getUserInfoById,
    createGroup,
} from '../apis/api';

import defaultUserImage from '../assets/user.png';

const GroupModalComponent = ({ isOpen, closeModal }) => {
    const token = getCookie('JWT');
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState([]);
    const [groupName, setGroupName] = useState('');

    const handleSearchInputChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
    };

    const performSearch = async () => {
        try {
            const data = await searchUsers(token, keyword);
            console.log(data);
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const handleCreateGroup = async () => {
        try {
            const groupCreationResult = await createGroup(token, groupName, selectedUserIds);

            if (groupCreationResult) {
                alert('Group created');
                setGroupName('');
                setSelectedUserIds([]);
                setSelectedUserDetails([]);
                closeModal();
                window.location.reload();
            } else {
                alert('Group name and participants field can’t be blank');
            }

        } catch (error) {
            console.error('Error creating group:', error.message);
            alert('Failed to create group');
        }
    };

    useEffect(() => {
        if (keyword.trim() !== '') {
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [keyword]);

    const userSelection = async (userId) => {
        try {
            const userDetails = await getUserInfoById(token, userId);

            setSelectedUserIds((prevIds) => {
                if (!prevIds.includes(userId)) {
                    return [...prevIds, userId];
                }
                return prevIds;
            });

            setSelectedUserDetails((prevDetails) => {
                const userDetailsExist = prevDetails.some(
                    (userDetail) => userDetail._id === userDetails._id
                );

                if (!userDetailsExist) {
                    return [...prevDetails, userDetails];
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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className='flex flex-col max-h-[full] max-w-lg w-full bg-[#3C1C63] rounded-lg mt-auto mb-auto p-6 highest'
            overlayClassName="overlay"
        >
            <h2 className="text-white text-2xl font-bold mb-4 text-center">Create group</h2>

            <div className='flex flex-col'>
                <input
                    type="text"
                    placeholder="Group Name"
                    className="mb-2 rounded-md border-2 bg-transparent text-white focus:bg-transparent w-full py-2 px-3 font-bold"
                    value={groupName}
                    onChange={handleGroupNameChange}
                />

                <div className="search-bar py-4 flex items-center space-x-4 w-full">
                    <input
                        className="w-full py-2 px-3 rounded-md border-2 bg-transparent text-white focus:bg-transparent"
                        type="input"
                        placeholder="Search user"
                        onChange={handleSearchInputChange}
                        value={keyword}
                    />
                    <button
                        className="bg-[#8b6bff] text-white py-2 px-4 rounded-md hover:bg-[#ffffff] hover:text-black"
                        onClick={handleCreateGroup}
                    >
                        Create
                    </button>
                </div>

                <div className="search-results mt-6 w-full">
                    {searchResults?.map((user) => (
                        <div
                            key={user._id}
                            className="user-card flex items-start rounded-md m-1 py-2 px-3 gap-3 bg-[#48484856] cursor-pointer text-white hover:text-black hover:bg-[#9678FF]"
                            onClick={() => userSelection(user._id)}
                        >
                            <img
                                src={user && user.profilePic ? user.profilePic : defaultUserImage}
                                alt={user.name}
                                className="w-12 h-12 object-contain rounded-full border-2"
                            />
                            <p className="font-semibold capitalize">{user.name}</p>
                        </div>
                    ))}
                </div>

                <div className="selected-users mt-6 flex space-x-3">
                    {selectedUserDetails.map((user) => (
                        <div key={user._id} className="flex flex-col items-center text-white">
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

                <div className='flex justify-center mt-4'>
                    <button
                        className="text-white rounded-md bg-[#ac2d2d] px-4 py-2 hover:bg-[rgb(255,0,0)]"
                        onClick={() => {
                            closeModal();
                            setSelectedUserDetails([]);
                            setSelectedUserIds([]);
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GroupModalComponent;
