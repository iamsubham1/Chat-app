import React, { useState, useEffect } from 'react';
import { BiCommentDetail } from 'react-icons/bi';
import { TbCircleDashed } from 'react-icons/tb';
import { IoMdMore } from 'react-icons/io';
import { FaFilter } from 'react-icons/fa6';
import ChatCard from './ChatCard';
import user from '../assets/user.png';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '@/utility/getcookie';
import { Button } from './ui/button';
import { logout } from '@/utility/logout';

const HomePage = () => {
    const token = getCookie('JWT');
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allChats, setAllChats] = useState([]);
    const [userInfo, setUserInfo] = useState('');
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId);
        // Fetch details when a chat is selected
        fetchChatDetails(chatId);
    };
    const fetchAllChats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/allChats', {
                headers: {
                    JWT: token,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setAllChats(data);
        } catch (error) {
            console.error('Error fetching all chats:', error.message);
        }
    };

    const fetchSearchResults = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/search?search=${keyword}`, {
                headers: {
                    JWT: token,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const fetchUserinfo = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                headers: {
                    JWT: token,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const userData = await response.json();
            setUserInfo(userData);
        } catch (error) {
            console.error('Error fetching user info results:', error.message);
        }
    };

    const fetchChatDetails = async (chatId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/message/getMessages/${chatId}`, {
                headers: {
                    JWT: token,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setChatDetails(data);
        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    };




    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
        fetchAllChats();
        fetchSearchResults();
        fetchUserinfo();
    }, [keyword]);

    return (
        <div className=" left w-screen h-screen relative flex justify-center" style={{ backgroundColor: '#030712' }}>
            <header className="w-screen h-[10vh] bg bg-violet-700"></header>
            <div className="main-section h-[90vh] w-[95vw] absolute top-10 flex">
                <div className="left w-[30%]" style={{ backgroundColor: '#27272A' }}>
                    <div className="top-section w-full h-[9%] bg-slate-400 flex">
                        <div className="profile-container w-[40%] flex gap-3 items-center px-3 font-medium">
                            <img className="rounded w-10 h-10 cursor-pointer" src={userInfo.profilePic} alt="User" />
                            <p className='capitalize'>{userInfo.name}</p>
                        </div>
                        <div className="extras w-[60%] flex justify-end gap-3 px-2 items-center text-xl text-black font-black">
                            <TbCircleDashed />
                            <BiCommentDetail />
                            <IoMdMore />
                        </div>
                    </div>
                    <div className="search-bar px-3 py-4 flex space-x-10 items-center text-white">
                        <input
                            className="border-none outline-none bg-slate-200 rounded-md w-[82%] py-1 px-2 text-black"
                            type="input"
                            placeholder="Search or start new chat"
                            onChange={(e) => setKeyword(e.target.value)}
                            value={keyword}
                        />
                        <button className="text-white" onClick={fetchSearchResults}>
                            <FaFilter />
                        </button>
                    </div>
                    <div className="chat-section w-full">
                        {((searchResults.length === 0 && allChats.length === 0) ? (
                            <div className="no-chats-message text-white text-center mt-4">
                                No chats to show
                            </div>
                        ) : (
                            (searchResults.length === 0 ? allChats : searchResults).map((chat, index) => (
                                <div key={chat._id}>
                                    <hr />
                                    <ChatCard chat={chat} isGroupChat={chat.isGroupChat} searchUser={searchResults[index]} user={userInfo}
                                        onSelectChat={handleChatSelect}
                                    />
                                </div>
                            ))
                        ))}
                    </div>
                </div>
                <div className="right w-[70%] bg-gray-800 text-white p-4 overflow-y-auto">

                    {chatDetails && (
                        <div>
                            <p className="text-lg font-bold mb-4">Selected Chat ID: {selectedChatId}</p>
                            {chatDetails.map((message, index) => (
                                <div key={index} className={`mb-4 flex ${message.sender._id === userInfo._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="flex items-center">
                                        {message.sender._id !== userInfo._id && (
                                            <img src={message.sender.profilePic} alt="Receiver" className="w-8 h-8 rounded-full mr-2" />
                                        )}
                                        <div className={`p-2 rounded-md ${message.sender._id === userInfo._id ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            <p>{message.content}</p>
                                        </div>
                                        {message.sender._id === userInfo._id && (
                                            <img src={message.sender.profilePic} alt="Sender" className="w-8 h-8 rounded-full ml-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </div>
            <Button onClick={() => logout('JWT')}>Logout</Button>
        </div>
    );
};

export default HomePage;
