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
                window.location.reload()
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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className='w-full h-full flex-col highest grid place-content-center bg bg-[#0f061ab6] modalBg font'
        >
            <div className='wrapper w-[40vw] content-between min-h-[60vh] '>
                <div className='flex-col p-4 bg-black items-center w-[60%] h-[100%]'>
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">Create group</h2>


                    <div className='bg  redDiv'>
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="Group Name"
                                className="rounded-md border-2 bg-transparent text-white focus:bg-transparent w-full py-2 px-3 font-bold"
                                value={groupName}
                                onChange={handleGroupNameChange}
                            />
                        </div>

                        <div className="search-bar py-4 space-x-4 items-center text-white w-[100%] flex justify-stretch">
                            <input
                                className="w-[90%] py-2 px-3 rounded-md border-2 bg-transparent text-white focus:bg-transparent"
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
                        </div>

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
                        </div>
                    </div>



                    <div className=' grid'>
                        <button
                            className="text-white rounded-md bg-[#ac2d2d] px-4 py-2 place-self-center hover:bg-[rgb(255,0,0)]"
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
            </div>
        </Modal>
    );
};

export default ModalComponent;
