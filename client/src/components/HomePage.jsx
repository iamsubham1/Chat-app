import React, { useState, useEffect } from 'react';
import { BiCommentDetail } from 'react-icons/bi';
import { TbCircleDashed } from 'react-icons/tb';
import { IoMdMore } from 'react-icons/io';
import { FaFilter } from 'react-icons/fa6';
import ChatCard from './ChatCard';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '@/utility/getcookie';
import { logout } from '@/utility/logout';
import { IoMdSend } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import io from 'socket.io-client';


const socket = io('http://localhost:8080', {
    transports: ['websocket'],

});


const HomePage = () => {

    const token = getCookie('JWT');
    const navigate = useNavigate();


    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allChats, setAllChats] = useState([]);
    const [userInfo, setUserInfo] = useState('');
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [messageContent, setMessageContent] = useState('');

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId);
        // Fetch details when a chat is selected
        fetchChatDetails(chatId);
    };


    const handleSendMessage = async () => {
        try {

            const response = await fetch(`http://localhost:8080/api/message/createMessage/${selectedChatId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                },
                body: JSON.stringify({
                    content: messageContent,
                    chatId: selectedChatId,
                }),
            });
            if (!response.ok) {
                console.error('Network response was not ok');
                throw new Error('Network response was not ok');
            }


            socket.emit('message', { content: messageContent, chatId: selectedChatId });

            setMessageContent('');
            fetchChatDetails(selectedChatId);
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
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
            console.log(chatId)
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

    const sortedChats = [...allChats].sort((chatA, chatB) => {
        const timeA = chatA.latestMessage ? new Date(chatA.latestMessage.createdAt) : 0;
        const timeB = chatB.latestMessage ? new Date(chatB.latestMessage.createdAt) : 0;
        return timeB - timeA;
    });



    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        fetchAllChats();
        fetchSearchResults();
        fetchUserinfo();

        // Connect to Socket.IO when the component mounts
        socket.connect();

        // Log when connected to Socket.IO
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        // Log when disconnected from Socket.IO
        socket.on('disconnect', (reason) => {
            console.log('Disconnected from Socket.IO server. Reason:', reason);
        });

        // Log any Socket.IO errors
        socket.on('error', (error) => {
            console.error('Socket.IO Error:', error);
        });

        // Log received messages from the server
        socket.on('message', (data) => {
            console.log('Received message from server:', data);
            fetchChatDetails(data.chatId);

            // Handle the received message (update state, etc.)
        });

        // Log when a message is sent to the server
        socket.on('messageSent', (data) => {
            console.log('Message sent to server:', data);
            fetchChatDetails(data.chatId);
        });


        // Cleanup on component unmount
        return () => {
            // Disconnect from Socket.IO when the component unmounts
            socket.disconnect();
            console.log('Socket.IO disconnected on component unmount');

        };

    }, [keyword, socket]);

    return (
        <div className="w-screen h-screen relative flex justify-center customBg ">
            <header className="w-screen h-[8vh] bg-[#121218] flex justify-between items-center text-[white] ">
                <h1 className='ml-5 customText text-2xl font-bold font-sans'>. CONNECT</h1>

                <TbLogout onClick={() => logout('JWT')} className='text-2xl mr-5 cursor-pointer hover:text-[red]' />

            </header>
            <div className="main-section h-[80vh] w-[95vw] absolute top-24 flex">
                <div className="left w-[30%] bg-[#121218] " >
                    <div className="top-section w-full h-[9%] bg-[#30303065] text-[#c7c7c7] flex">
                        <div className="profile-container w-[40%] flex gap-3 items-center px-3 font-medium">
                            <img className="rounded-full w-10 h-10 cursor-pointer" src={userInfo.profilePic} alt="User" />
                            <p className='capitalize'>{userInfo.name}</p>
                        </div>
                        <div className="extras w-[60%] flex justify-end gap-3 px-2 items-center text-xl text-black font-black">
                            <TbCircleDashed className='text-[#c7c7c7] ' />
                            <BiCommentDetail className='text-[#c7c7c7]' />
                            <IoMdMore className='text-[#c7c7c7]' />
                        </div>
                    </div>
                    <div className="search-bar px-3 py-4 flex space-x-10 items-center text-white">
                        <input
                            className="border-none outline-none bg-[white] rounded-md w-[82%] py-1 px-2 text-black"
                            type="input"
                            placeholder="Search or start new chat"
                            onChange={(e) => setKeyword(e.target.value)}
                            value={keyword}
                        />
                        <button className="text-white" onClick={fetchSearchResults}>
                            <FaFilter />
                        </button>
                    </div>
                    <div className="chat-section w-full ">
                        {((searchResults.length === 0 && allChats.length === 0) ? (
                            <div className="no-chats-message text-white text-center mt-4">
                                No chats to show
                            </div>
                        ) : (
                            (searchResults.length === 0 ? sortedChats : searchResults).map((chat, index) => (
                                <div key={chat._id}>
                                    <hr className='border-[#8F5EF6]' />

                                    <ChatCard chat={chat} isGroupChat={chat.isGroupChat} searchUser={searchResults[index]} user={userInfo}
                                        onSelectChat={handleChatSelect}

                                    />
                                    <hr className='border-[#8F5EF6]' />
                                </div>
                            ))
                        ))}
                    </div>
                </div>
                <div className="right w-[70%] text-white p-4 overflow-y-auto relative grid">
                    <div className='messagesContainer h-[90%] overflow-y-auto overflow-x-hidden p-4 custom-scrollbar z-10'>
                        {selectedChatId ? (
                            chatDetails && chatDetails.length > 0 ? (
                                <div>
                                    {chatDetails.map((message, index) => (
                                        <div key={index} className={`mb-4 flex ${message.sender._id === userInfo._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="flex items-center">
                                                {message.sender._id !== userInfo._id && (
                                                    <img src={message.sender.profilePic} alt="Receiver" className="w-8 h-8 rounded-full mr-2" />
                                                )}
                                                <div className={`p-2 rounded-md ${message.sender._id === userInfo._id ? 'bg-[#9678FF]' : 'bg-[#4A4F63]'}`}>
                                                    <p> {message.content}</p>
                                                </div>
                                                {
                                                    message.sender._id === userInfo._id && (
                                                        <img src={message.sender.profilePic} alt="Sender" className="w-8 h-8 rounded-full ml-2" />
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-messages-message text-white text-center mt-4">
                                    No messages to show
                                </div>
                            )
                        ) : (
                            <div className="welcome-message text-white text-center mt-4 text-medium">
                                <h1 className='text-2xl'> Welcome to . <span className='customText font-bold text-2xl'>CONNECT</span></h1>

                                A Real time Chat-Application... !
                            </div>
                        )}
                    </div>

                    <div className="bottom-0 right-0 w-[100%]  py-4 px-6 bg-[#30303065] flex items-center absolute">
                        <input
                            className="border-solid-red outline-none bg-slate-200 rounded-md flex-1 py-1 px-2 text-black"
                            type="text"
                            placeholder="Type your message..."
                            onChange={(e) => setMessageContent(e.target.value)}
                            value={messageContent}
                        />

                        <IoMdSend onClick={handleSendMessage} className='ml-5 hover:text-[#9678FF] text-2xl cursor-pointer' />

                    </div>
                </div>
            </div>

        </div>
    );
};

export default HomePage;
