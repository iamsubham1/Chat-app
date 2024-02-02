import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getCookie } from '@/utility/getcookie';

import {
    searchUsers,
    getUserInfoById,
    createGroup,
} from '../apis/api';
import defaultUserImage from '../assets/user.png';

const ModalComponent = ({ isOpen, closeModal }) => {


    const token = getCookie('JWT');

    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
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
            setSearchResults(data);
            console.log('Searched User Info:', data);
        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const handleCreateGroup = async () => {
        try {
            const groupCreationResult = await createGroup(token, groupName, selectedUsers);

            if (groupCreationResult) {
                console.log('Group creation result:', groupCreationResult);
                alert('Group created');
                setGroupName('');
                setSelectedUsers([]);

                // Close the modal on successful group creation
                closeModal();
            }

        } catch (error) {
            console.error('Error creating group:', error.message);
            alert('Failed to create group');
        }
    };

    useEffect(() => {
        performSearch();
    }, [keyword]);

    // Function to add or remove a user from the selectedUsers array
    const toggleUserSelection = async (userId) => {
        try {
            const userDetails = await getUserInfoById(token, userId);

            setSelectedUsers((prevUsers) => {
                const userIndex = prevUsers.indexOf(userId);

                if (userIndex !== -1) {
                    // User is already selected, remove from the list
                    const updatedUsers = [
                        ...prevUsers.slice(0, userIndex),
                        ...prevUsers.slice(userIndex + 1),
                    ];
                    console.log('Selected Users:', updatedUsers);
                    return updatedUsers;
                } else {
                    // User is not selected, add to the list
                    const updatedUsers = [...prevUsers, userId];
                    console.log('Selected Users:', updatedUsers);
                    return updatedUsers;
                }
            });
            setKeyword('')

        } catch (error) {
            console.error('Error fetching user details:', error.message);
        }
    };



    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            className='z-100 bg-[#13941b83] w-full h-full flex'
        >
            <div className='flex-1 p-6'>
                <h2 className="text-white text-2xl font-bold mb-4">Hello Modal</h2>

                <div className="search-bar px-3 py-4 flex space-x-4 items-center text-white">
                    <input
                        className="border-none outline-none bg-[white] rounded-md w-[70%] py-2 px-3 text-black"
                        type="input"
                        placeholder="Search or start new chat"
                        onChange={handleSearchInputChange}
                        value={keyword}
                    />
                </div>

                {/* Display search results as cards */}
                <div className="search-results mt-6 grid gap-4 grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((user) => (
                        <div key={user._id} className="user-card border border-gray-300 p-4 rounded-md">
                            <img
                                src={user && user.profilePic ? user.profilePic : defaultUserImage}
                                alt={user.name}
                                className="w-12 h-12 object-contain mb-2 rounded-full"
                            />
                            <p className="text-black font-semibold">{user.name}</p>
                            <div className="flex justify-between mt-2">
                                <button
                                    className={`${selectedUsers.some((selectedUser) => selectedUser.id === user._id)
                                        ? 'bg-red-500 text-white'
                                        : 'bg-green-500 text-white'
                                        } py-2 px-4 rounded-md`}
                                    onClick={() => toggleUserSelection(user._id)}
                                >
                                    {selectedUsers.some((selectedUser) => selectedUser.id === user._id) ? 'Remove' : 'Add'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Display selected users */}
                <div className="selected-users mt-6 flex space-x-4">
                    {selectedUsers.map((user) => (
                        <div key={user.id} className="text-white flex flex-col items-center">
                            <img
                                src={user.profilePic || defaultUserImage}
                                alt={user.name}
                                className="w-10 h-10 object-contain mb-2 rounded-full"
                            />
                            <p className="text-xs">{user.name}</p>
                        </div>
                    ))}
                </div>

                <button
                    className="bg-gray-700 text-white py-2 px-4 mt-6 rounded-md"
                    onClick={closeModal}
                >
                    Close
                </button>
            </div>
            <div className='flex-1 ml-6 p-4 bg-gray-800 rounded-md'>
                <h3 className="text-white text-lg font-semibold mb-2">Create Group</h3>
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Group Name"
                        className="border-none outline-none bg-[white] rounded-md w-full py-2 px-3 text-black"
                        value={groupName}
                        onChange={handleGroupNameChange}
                    />
                </div>
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    onClick={handleCreateGroup}
                >Create
                </button>
            </div>
        </Modal>
    );
};

export default ModalComponent;
