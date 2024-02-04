import React, { useState, useEffect } from 'react';
import { BiCommentDetail } from 'react-icons/bi';
import { TbCircleDashed } from 'react-icons/tb';
import { IoMdMore } from 'react-icons/io';
import ChatCard from './ChatCard';
import { IoFilter } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { getCookie } from '@/utility/getcookie';
import { logout } from '@/utility/logout';
import { IoMdSend } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import io from 'socket.io-client';
import defaultUserImage from '../assets/user.png';
import { MdGroups } from "react-icons/md";
import { IoClose } from "react-icons/io5";


import ModalComponent from '../components/Modal'; // Import your modal component
import ChatModalComponent from '../components/ChatModal';


import {
    getAllChats,
    searchUsers,
    getUserInfo,
    getMessages,
    sendMessage
} from '../apis/api';
import TypingCard from './TypingCard';

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
    const [selectedChatInfo, setSelectedChatInfo] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [istyping, setIsTyping] = useState(false);
    const [showTyping, setShowTyping] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleChatSelect = async (chatId, searchUser) => {
        // If it's a searched user, create a new chat if not already existing
        if (searchUser) {
            const userId = searchUser._id;
            console.log(userId)

            const createdChatId = await createChatWithUser(userId);

            if (createdChatId) {
                console.log("Chat created with id:", createdChatId);
                setSelectedChatId(createdChatId);
                fetchChatDetails(createdChatId);
            }
        } else {
            // Handle the selection of an existing chat (e.g., fetch chat details)
            setSelectedChatId(chatId);
            fetchChatDetails(chatId);
        }
    };

    const handleSendMessage = async () => {
        try {
            const success = await sendMessage(token, selectedChatId, messageContent);


            if (success) {              //data
                socket.emit('message', { content: messageContent, chatId: selectedChatId });
                setMessageContent('');
                fetchChatDetails(selectedChatId);
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    };

    const createChatWithUser = async (userId) => {
        try {
            console.log('Creating a new chat with user ID:', userId);

            const response = await fetch('http://localhost:8080/api/chat/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                },
                body: JSON.stringify({
                    userId,
                }),
            });

            if (!response.ok) {
                console.error('Network response was not ok');
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data && data._id) {
                console.log('New chat created with chat ID:', data._id);

                // Update the state or perform any necessary actions

                setAllChats([...allChats, data]);
                setSelectedChatId(data._id);

                // Fetch chat details immediately after creating the chat
                console.log("chatId or new chat is ", data._id)
                fetchChatDetails(data._id);

                return data._id; // Return the chat ID
            } else {
                console.error('Invalid response from the server:', data);
                return null;
            }
        } catch (error) {
            console.error('Error creating chat:', error.message);
            return null;
        }
    };

    const fetchAllChats = async () => {
        try {
            const data = await getAllChats(token);
            setAllChats(data);
        } catch (error) {
            console.error('Error fetching all chats:', error.message);
        }
    };

    const fetchSearchResults = async () => {
        try {
            const data = await searchUsers(token, keyword);
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error.message);
        }
    };

    const fetchUserinfo = async () => {
        try {
            const userData = await getUserInfo(token);
            setUserInfo(userData);
        } catch (error) {
            console.error('Error fetching user info:', error.message);
        }
    };

    const fetchChatDetails = async (chatId) => {
        try {
            const data = await getMessages(token, chatId);
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

    const handleProfile = () => {
        navigate('/profile')
    }
    useEffect(() => {
        if (keyword !== '') {
            // If keyword is not empty, fetch search results
            fetchSearchResults();
        } else {
            setKeyword("")
            fetchSearchResults()
        }
    }, [keyword]);


    useEffect(() => {
        if (selectedChatId && istyping) {
            socket.emit('typing', { chatId: selectedChatId, isTyping: true });

        }

        return () => {
            if (selectedChatId) {
                socket.emit('typing', { chatId: selectedChatId, isTyping: false });
            }
        };
    }, [istyping, selectedChatId])



    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        fetchAllChats();
        fetchSearchResults();
        fetchUserinfo();

        socket.connect();

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from Socket.IO server. Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket.IO Error:', error);
        });

        socket.on('message', (data) => {
            console.log("sent message", data.content)
            fetchChatDetails(data.chatId);
            fetchAllChats();
        });

        socket.on('typing', (data) => {
            console.log("typing status on client side is ", data.isTyping)
            // console.log("typing user is ", userId)
            if (data.isTyping) {
                setShowTyping(true)
            } else {
                setShowTyping(false)

            }


        });

        return () => {
            socket.disconnect();
            // console.log('Socket.IO disconnected on component unmount');
        };
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    const openChatModal = () => {
        console.log("clicked")
        setIsChatModalOpen(true);
        console.log(isChatModalOpen)
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
    };

    useEffect(() => {
        if (selectedChatId) {
            const selectedChat = allChats.find(chat => chat._id === selectedChatId);
            setSelectedChatInfo(selectedChat);
        }
        scrollToBottom();
    }, [chatDetails, selectedChatId, allChats]);

    const scrollToBottom = () => {
        const messagesContainer = document.querySelector('.messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
    };



    const deleteChat = async (chatId) => {
        console.log('btn clicked')
        try {
            const response = await fetch(`http://localhost:8080/api/chat/deleteChat/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    JWT: token,
                }

            });

            if (response.ok) {
                alert('chat deleted successfully')
                window.location.reload();
            } else {
                alert('cant delete chat')
            }


        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    }
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center customBg gap-6 overflow-x-hidden">

            <header className="w-screen h-[8vh] bg-[#121218] flex justify-between items-center text-[white]">
                <h1 className='ml-5 customText text-2xl font-bold font-sans'>.CONNECT</h1>
                <TbLogout onClick={() => logout('JWT')} className='text-2xl mr-5 cursor-pointer hover:text-[red]' />
            </header>


            <div className="main-section h-[80vh] w-[95vw] flex ">

                <div className="left w-[30%] bg-[#121218] overflow-y-scroll custom-scrollbar " >

                    <div className="top-section w-full h-[9%] bg-[#30303065] text-[#c7c7c7] flex">
                        <div className="profile-container w-[40%] flex gap-3 items-center px-3 font-medium">
                            <img className="rounded-full w-10 h-10 cursor-pointer" src={userInfo.profilePic || defaultUserImage} alt="User" onClick={handleProfile} />
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
                            className="border-none outline-none bg-[white] rounded-md w-[82%] py-1 px-2 text-black "
                            type="input"
                            placeholder="Search or start new chat"
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                () => {

                                    fetchSearchResults()
                                }

                            }}
                            value={keyword}
                        />

                        {/* change this on click to clear */}
                        <div className='flex p-2 gap-5'>
                            <button className="text-2xl  hover:text-[#9678FF] " ><IoFilter /></button>
                            <button className="text-3xl hover:text-[#9678FF] " ><MdGroups onClick={openModal} /></button>
                        </div>

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


                <div className="right w-[70%] text-white p-4 overflow-y-auto relative grid ">

                    <div className="top-10 left-0  z-1 flex items-center mb-4 max-h-[50px]">

                        {selectedChatInfo && (
                            <img className="w-10 h-10 rounded-full mr-5 caret-transparent z-0" src={selectedChatInfo.isGroupChat ? selectedChatInfo.groupPic : selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.profilePic || defaultUserImage} alt="Profile" />
                        )}
                        <h6 className='z-5 text-[#a882d1] text-xl capitalize font-semibold z-0 cursor-pointer hover:text-white'
                            onClick={openChatModal} >

                            {selectedChatInfo ? ` ${selectedChatInfo.isGroupChat ? selectedChatInfo.chatName : selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.name || 'Unknown'}` : ''}
                        </h6>


                        {selectedChatInfo && (
                            <button className="ml-auto mr-2 z-0" onClick={toggleDropdown}>
                                {!showDropdown ? (
                                    <IoMdMore className="text-[#c7c7c7] text-2xl hover:text-[#9678FF]" />
                                ) : (
                                    <IoClose className="text-[#c7c7c7] text-2xl hover:text-[#9678FF]" />
                                )}
                            </button>
                        )}


                        {showDropdown && (
                            <div className="absolute top-14 right-11 mt-1 bg-white border border-gray-300 round shadow-md w-[5vw] self-center highest">


                                {/* Dropdown items */}

                                {selectedChatInfo && showDropdown ? (<div className="py-2 gap-2 highest">
                                    <button className="w-full  focus:outline-none text-black hover:bg-[#9678FF] text-center mb-2">
                                        Profile
                                    </button>
                                    <button className="w-full  focus:outline-none text-black hover:bg-[#9678FF] text-center" onClick={() => deleteChat(selectedChatInfo._id)}>
                                        Delete
                                    </button>
                                </div>) : ""}

                            </div>
                        )}



                    </div>

                    <div className='messagesContainer h-[90%] overflow-y-auto overflow-x-hidden p-4 custom-scrollbar z-0'>

                        {selectedChatId ? (
                            chatDetails && chatDetails.length > 0 ? (
                                <div>
                                    {chatDetails.map((message, index) => (
                                        <div key={index} className={`mb-4 flex ${message.sender._id === userInfo._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="flex items-center">
                                                {message.sender._id !== userInfo._id && (
                                                    <img src={message.sender.profilePic || defaultUserImage} alt="Receiver" className="w-8 h-8 rounded-full mr-2" />
                                                )}
                                                <div className={`p-2 rounded-md ${message.sender._id === userInfo._id ? 'bg-[#9678FF]' : 'bg-[#4A4F63]'}`}>
                                                    <p> {message.content}</p>
                                                </div>
                                                {
                                                    message.sender._id === userInfo._id && (
                                                        <img src={message.sender.profilePic || defaultUserImage} alt="Sender" className="w-8 h-8 rounded-full ml-2" />
                                                    )
                                                }
                                            </div>

                                            <div className="bottom-0 right-0 w-[100%]  py-4 px-6 bg-[#30303065] flex items-center absolute">

                                                <input
                                                    className="border-solid-red outline-none bg-slate-200 rounded-md flex-1 py-1 px-2 text-black"
                                                    type="text"
                                                    placeholder="Type your message..."
                                                    onChange={(e) => {
                                                        setMessageContent(e.target.value);
                                                    }}
                                                    onFocus={() => {
                                                        setIsTyping(true);
                                                        console.log("Is Typing: true");
                                                    }}
                                                    onBlur={() => {
                                                        setIsTyping(false);
                                                        console.log("Is Typing: false");
                                                    }}
                                                    value={messageContent}


                                                />

                                                <IoMdSend onClick={handleSendMessage} className='ml-5 hover:text-[#9678FF] text-2xl cursor-pointer' />


                                            </div>
                                            {showTyping && (
                                                <TypingCard className=".typingCard " />
                                            )}
                                        </div>

                                    ))}
                                </div>
                            ) : (
                                <div className="no-messages-message text-white text-center mt-4">
                                    No messages to show
                                    <div className="bottom-0 right-0 w-[100%]  py-4 px-6 bg-[#30303065] flex items-center absolute">
                                        <input
                                            className="border-solid-red outline-none bg-slate-200 rounded-md flex-1 py-1 px-2 text-black"
                                            type="text"
                                            placeholder="Type your message..."
                                            onChange={(e) => {
                                                setMessageContent(e.target.value);

                                            }}
                                            value={messageContent} />

                                        <IoMdSend onClick={handleSendMessage} className='ml-5 hover:text-[#9678FF] text-2xl cursor-pointer' />


                                    </div>
                                </div>

                            )
                        ) : (
                            <div className="welcome-message text-white text-center mt-4 text-medium">
                                <h1 className='text-2xl'> Welcome to  <span className='customText font-bold text-2xl'>.CONNECT</span></h1>
                                A Real time Chat-Application... !
                            </div>
                        )}


                    </div>


                </div>

                <ModalComponent isOpen={isModalOpen} closeModal={closeModal} className='' />
                <ChatModalComponent isOpen={isChatModalOpen} closeModal={closeChatModal} selectedChatId={selectedChatId} user={userInfo} token={token} className='' />

            </div>
            <footer className='text-white text-left p-4 bg-[#3f3f3f54] w-full overflow-hidden'>© Subham Das</footer>
        </div>
    );
};

export default HomePage;
