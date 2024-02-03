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

const ModalComponent = ({ isOpen, closeModal }) => {


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
            setSearchResults(data);
            // console.log('Searched User Info:', data);
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
                closeModal();
            } else {
                alert('No participants or name added');



            }

        } catch (error) {
            console.error('Error creating group:', error.message);
            alert('Failed to create group');
        }
    };

    useEffect(() => {
        performSearch();
    }, [keyword]);

    // Function to add a user to the selectedUsers array
    const toggleUserSelection = async (userId) => {
        try {
            // Check if the user is already selected
            if (selectedUserIds.includes(userId)) {
                // User is already selected, no need to fetch details or update state
                return;
            }

            // Fetch user details using API
            const userDetails = await getUserInfoById(token, userId);

            setSelectedUserIds((prevIds) => {
                // Check if the user is not already selected, then add to the list
                if (!prevIds.includes(userId)) {
                    const updatedIds = [...prevIds, userId];

                    // Check if userDetails already exists in selectedUserDetails
                    const userDetailsExist = selectedUserDetails.some(
                        (userDetail) => userDetail._id === userDetails._id
                    );

                    // If userDetails does not exist, append to selectedUserDetails
                    if (!userDetailsExist) {
                        setSelectedUserDetails((prevDetails) => [...prevDetails, userDetails]);
                        console.log("selectedUserDetails", selectedUserDetails)

                    }

                    console.log('Selected User IDs:', updatedIds);
                    return updatedIds;
                }

                return prevIds;

            });
            console.log('Selected User details:', selectedUserDetails);

            setKeyword('');
        } catch (error) {
            console.error('Error adding user to selection:', error.message);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}

            className=' w-full h-full flex-col highest grid place-content-center bg bg-[#0000007a] modalBg'
        >

            <div className='wrapper w-[40vw] '>
                <div className='flex-col p-6 bg-black items-center w-[60%] h-[100%]'>
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">Create group</h2>

                    <button
                        className=" text-white rounded-md relative bottom-[6vh] left-[25vw] "
                        onClick={() => {
                            closeModal(),
                                setSelectedUserDetails([]);
                            selectedUserIds([])

                        }}
                    >
                        <IoClose className="text-[#c7c7c7] text-2xl hover:text-[#9678FF]" />
                    </button>
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Group Name"
                            className="border-none outline-none bg-[white] rounded-md w-full py-2 px-3 text-black"
                            value={groupName}
                            onChange={handleGroupNameChange}
                        />
                    </div>

                    <div className="search-bar  py-4 space-x-4 items-center text-white  w-[100%] flex justify-stretch">
                        <input
                            className="border-none outline-none bg-[white] rounded-md w-[90%] py-2 px-3 text-black"
                            type="input"
                            placeholder="Search or start new chat"
                            onChange={handleSearchInputChange}
                            value={keyword}
                        />
                        <button
                            className="bg-blue-500 text-white py-2 px-4 rounded-md"
                            onClick={handleCreateGroup}
                        >Create
                        </button>
                    </div>

                    {/* Display search results as cards */}

                    <div className="search-results mt-6 grid gap-4 grid-cols-2 lg:grid-cols-3 w-[100%]">
                        {searchResults.map((user) => (
                            <div key={user._id} className="user-card border border-gray-300 px-8 gap-5 rounded-md flex " >
                                <img
                                    src={user && user.profilePic ? user.profilePic : defaultUserImage}
                                    alt={user.name}
                                    className="w-12 h-12 object-contain mb-2 rounded-full"
                                />
                                <p className="text-black font-semibold">{user.name}</p>
                                <button
                                    className='bg-green-500 text-white py-2 px-4 rounded-md '
                                    onClick={() => toggleUserSelection(user._id)}
                                >
                                    Add
                                </button>
                            </div>
                        ))}

                    </div>

                    {/* Display selected users */}
                    <div className="selected-users mt-6 flex space-x-4">
                        {selectedUserDetails.map((user) => (
                            <div key={user.userId} className="text-white flex flex-col items-center">
                                <img
                                    src={user.profilePic || defaultUserImage}
                                    alt={user.name}
                                    className="w-10 h-10 object-contain mb-2 rounded-full"
                                />
                                <p className="text-xs">{user.name}</p>
                            </div>
                        ))}
                    </div>


                </div>

            </div>

        </Modal>
    );
};

export default ModalComponent;