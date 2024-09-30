import React, { useState, useEffect, useRef } from 'react';
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
import GroupModalComponent from './GroupModal';
import ChatModalComponent from './ChatModal';
import {
    getAllChats,
    searchUsers,
    getUserInfo,
    getMessages,
    sendMessage
} from '../apis/api';
import TypingCard from './TypingCard';

const socket = io('https://chat-app-vzjv.onrender.com', {
    transports: ['websocket'],

});


const HomePage = () => {
    const fileInputRef = useRef(null);

    const token = getCookie('JWT');

    let participantStatusVideo = [];

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
    const [showstatus, setShowStatus] = useState(false);
    const [loading, setloading] = useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleVideoEnd = () => {

        setShowStatus(false);

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
                fetchMessages(createdChatId);
            }
        } else {
            // Handle the selection of an existing chat (e.g., fetch chat details)
            setSelectedChatId(chatId);
            fetchMessages(chatId);

        }
    };

    const handleSendMessage = async () => {
        try {
            const success = await sendMessage(token, selectedChatId, messageContent);


            if (success) {
                console.log(success);
                //data  
                socket.emit('message', { content: messageContent, chatId: selectedChatId });

                setMessageContent('');
                fetchMessages(selectedChatId);
                console.log(chatDetails);

            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    };

    const createChatWithUser = async (userId) => {
        try {
            console.log('Creating a new chat with user ID:', userId);

            const response = await fetch('https://chat-app-vzjv.onrender.com/api/chat/create', {
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
                fetchMessages(data._id);

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

    const fetchSearchResults = async (keyword) => {
        try {
            if (!keyword) {
                return; // Exit if there's no keyword
            }
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
            console.log(userData.statusVideo);
        } catch (error) {
            console.error('Error fetching user info:', error.message);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const data = await getMessages(token, chatId);
            setChatDetails(data);


        } catch (error) {
            console.error('Error fetching chat details:', error.message);
        }
    };

    const handleUpload = () => {
        fileInputRef.current.click();
    };

    const handleVideoFileChange = async (event) => {
        const file = event.target.files && event.target.files[0];

        try {
            setloading(true);
            console.log('File selected:', file);

            const formData = new FormData();
            formData.append('video', file);

            console.log('Sending file to server...');
            const response = await fetch('https://chat-app-vzjv.onrender.com/api/user/uploadVideo', {
                method: 'POST',
                headers: {
                    'JWT': token,
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error uploading file');
            }

            console.log('File upload successful. Retrieving response data...');
            const data = await response.json();
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            console.log('File upload process completed.');
            setloading(false);
            alert('status uploaded')

        }
    };


    const sortedChats = [...allChats].sort((chatA, chatB) => {
        const timeA = chatA.latestMessage ? new Date(chatA.latestMessage.createdAt) : 0;
        const timeB = chatB.latestMessage ? new Date(chatB.latestMessage.createdAt) : 0;
        return timeB - timeA;
    });


    console.log(sortedChats, "adasdasdsadasdasdsadasdsad");
    console.log(searchResults, "adasdasd===============????????????????");


    const handleProfile = () => {
        navigate('/profile')
    }


    useEffect(() => {
        // Only fetch search results if keyword is not empty
        if (keyword.trim() !== '') {
            fetchSearchResults(keyword);
        } else {
            // Clear search results or handle the empty case if needed
            setSearchResults([]);  // Assuming you have a state for search results
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


    // useEffect(() => {
    //     // Ensure chatDetails is not null or undefined
    //     if (chatDetails) {
    //         console.log(allChats[0].latestMessage)
    //         if (chatDetails.length > 0) {
    //             const lastMessageReadBy = chatDetails[chatDetails.length - 1].readBy;
    //             console.log("ReadBy array of the last message:", chatDetails);
    //         } else {
    //             console.log("ChatDetails is empty.");
    //         }
    //     }
    // }, [chatDetails]);



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
            fetchMessages(data.chatId);
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
        // console.log("clicked")
        setIsChatModalOpen(true);
        // console.log(isChatModalOpen)
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
    };

    const scrollToBottom = () => {
        const messagesContainer = document.querySelector('.messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
    };

    const deleteChat = async (chatId) => {
        console.log('btn clicked')
        try {
            const response = await fetch(`https://chat-app-vzjv.onrender.com/api/chat/deleteChat/${chatId}`, {
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

    useEffect(() => {
        if (selectedChatId) {
            const selectedChat = allChats.find(chat => chat._id === selectedChatId);
            setSelectedChatInfo(selectedChat);

        }
        scrollToBottom();


    }, [chatDetails, selectedChatId, allChats]);


    if (loading) {
        return (<div className="spinner-border" role="status" id='spinner'>
            <span className="visually-hidden">Loading...</span>
        </div>)
    }



    return (
        <div className="w-screen h-screen flex flex-col items-center  customBg gap-6 overflow-x-hidden">
            <header className="w-full h-[8vh] bg-[#121218] flex justify-between items-center text-[white] ">
                <h1 className="ml-5 customText text-2xl font-bold font-sans">.CONNECT</h1>
                <TbLogout onClick={() => logout('JWT')} className="text-2xl mr-5 cursor-pointer hover:text-[red]" />
            </header>

            <div className="main-section h-[80vh] w-full md:w-[95vw] flex flex-col md:flex-row">
                <div className={`left w-full sm:w-[60%] lg:w-[30%] bg-[#121218] custom-scrollbar ${selectedChatId ? 'hidden md:block' : 'block'}`}>
                    <div className="top-section w-full bg-[#30303065] text-[#c7c7c7] flex h-[8vh]">
                        <div className="profile-container w-[40%] flex gap-3 items-center px-3 font-medium">
                            <img
                                className="rounded-full w-10 h-10 cursor-pointer hover:border-2"
                                src={userInfo.profilePic || defaultUserImage}
                                alt="User"
                                onClick={handleProfile}
                            />
                            <p className="capitalize text-xl text-[#A47FCC] font-bold">{userInfo.name}</p>
                        </div>
                        <div className="extras w-[60%] flex justify-end gap-3 px-2 items-center text-xl text-black font-black">
                            <TbCircleDashed className="text-[#c7c7c7] hover:text-[#9678FF] hover:cursor-pointer" onClick={handleUpload} title="Upload status" />
                            <form encType="multipart/form-data" method="post">
                                <input
                                    type="file"
                                    id="videoInput"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleVideoFileChange}
                                />
                            </form>
                            <IoMdMore className="text-[#c7c7c7]" />
                        </div>
                    </div>

                    <div className="search-bar px-3 py-4 flex space-x-10 items-center text-white">
                        <input
                            className="border-none outline-none bg-[white] rounded-md w-[82%] py-1 px-2 text-black"
                            type="text"
                            placeholder="Search or start new chat"
                            onChange={(e) => setKeyword(e.target.value)}
                            value={keyword}
                        />
                        <div className="flex p-2 gap-5">
                            <button className="text-3xl hover:text-[#9678FF]" title="Create group">
                                <MdGroups onClick={openModal} />
                            </button>
                        </div>
                    </div>

                    <div
                        className={`chat-section w-full h-[76%] ${searchResults.length === 0 && allChats.length === 0 ? 'overflow-y-hidden' : 'overflow-y-scroll'} custom-scrollbar`}
                    >
                        {searchResults.length === 0 && allChats.length === 0 ? (
                            <div className="no-chats-message text-white text-center h-[80vh] overflow-y-hidden">
                                <p className="mb-0 mt-0">No chats to show</p>
                            </div>
                        ) : (
                            (searchResults.length === 0 ? sortedChats : searchResults).map((chat, index) => (
                                <div key={chat._id} className="bg-green-300">
                                    <hr className="border-[#8F5EF6]" />
                                    <ChatCard
                                        chat={chat}
                                        isGroupChat={chat.isGroupChat}
                                        searchUser={searchResults[index]}
                                        user={userInfo}
                                        onSelectChat={handleChatSelect}
                                    />
                                    <hr className="border-[#8F5EF6]" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Selected Chat Section */}
                <div className={`right w-full h-full md:w-[70%] text-white p-4 relative overflow-y-hidden ${selectedChatId ? 'grid' : 'hidden md:grid'}`}>
                    {selectedChatId ? (
                        <>
                            {/* Close Button for Mobile View */}
                            <div className="flex items-center mb-4 z-[10] mt-0 max-h-10">
                                {selectedChatInfo && (
                                    <img
                                        className={`w-10 h-10 rounded-full mr-5 caret-transparent ${!selectedChatInfo.isGroupChat &&
                                            (selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.statusVideo?.length >= 1 ? 'gradient cursor-pointer' : '')}`}
                                        src={selectedChatInfo.isGroupChat
                                            ? (selectedChatInfo.groupPic ? selectedChatInfo.groupPic : defaultUserImage)
                                            : (selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.profilePic || defaultUserImage)}
                                        alt="Profile"
                                        onClick={() => {
                                            const participantStatusVideo = selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.statusVideo;
                                            if (!selectedChatInfo.groupPic && participantStatusVideo?.length >= 1) {
                                                setShowStatus(true);
                                            }
                                        }}
                                    />
                                )}
                                <h6
                                    className="text-[#a882d1] text-xl capitalize font-semibold cursor-pointer hover:text-white"
                                    onClick={openChatModal}
                                >
                                    {selectedChatInfo ? `${selectedChatInfo.isGroupChat ? selectedChatInfo.chatName : selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.name || 'Unknown'}` : ''}
                                </h6>
                                <button className="text-[#9678FF] text-xl ml-auto" onClick={() => setSelectedChatId(null)}>
                                    <IoClose className="text-[#ff6262] text-2xl hover:text-[red]" />
                                </button>
                            </div>

                            <div className="messagesContainer h-[90%]  p-4 overflow-y-auto overflow-x-hidden z-[10]  custom-scrollbar">
                                {selectedChatId ? (
                                    chatDetails && chatDetails.length > 0 ? (
                                        <div className="flex flex-col flex-1 gap-5 overflow-y-scroll  custom-scrollbar ">
                                            {/* Messages Area */}
                                            <div className="flex-1 overflow-y-auto rounded-lg p-4 custom-scrollbar">
                                                {chatDetails.map((message, index) => (
                                                    <div key={index} className={`mb-4 flex ${message.sender._id === userInfo._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <div className="flex items-center">
                                                            {message.sender._id !== userInfo._id && (
                                                                <img
                                                                    src={message.sender.profilePic || defaultUserImage}
                                                                    alt="Receiver"
                                                                    className="w-8 h-8 rounded-full mr-2"
                                                                />
                                                            )}
                                                            <div className={`p-2 rounded-md ${message.sender._id === userInfo._id ? 'bg-[#9678FF]' : 'bg-[#4A4F63]'}`}>
                                                                <p>{message.content}</p>
                                                            </div>
                                                            {message.sender._id === userInfo._id && (
                                                                <img
                                                                    src={message.sender.profilePic || defaultUserImage}
                                                                    alt="Sender"
                                                                    className="w-8 h-8 rounded-full ml-2"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Show typing indicator */}
                                                {showTyping && <TypingCard className="typingCard" />}
                                            </div>

                                            {/* Input Area */}

                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center flex-1">
                                            <div className="no-messages-message text-center text-white mt-4">
                                                No messages in this chat
                                            </div>

                                        </div>
                                    )
                                ) : (
                                    <div className="welcome-message text-white text-center mt-4 text-medium flex-1 flex flex-col items-center justify-center">
                                        <h1 className="text-2xl">
                                            Welcome to <span className="customText font-bold text-2xl">.CONNECT</span>
                                        </h1>
                                        <p>A Real-time Chat Application...!</p>
                                    </div>
                                )}
                            </div>

                            <div className=" bg-[#454545aa] flex items-center z-[12] px-3 h-[50px] self-end">
                                <input
                                    className="border outline-none rounded-md flex-1 py-1 px-2 text-black"
                                    type="text"
                                    placeholder="Type your message..."
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                    value={messageContent}
                                />
                                <IoMdSend
                                    onClick={handleSendMessage}
                                    className="ml-5 hover:text-[#9678FF] text-2xl cursor-pointer"
                                />

                            </div>
                        </>
                    ) : null}

                    {showstatus && (
                        <div className="video z-[12] bg-[#000000] w-full sm:w-[30vw] h-[90vh] sm:h-[80vh] flex absolute top-0 overflow-hidden">
                            <button
                                className="absolute top-2 right-2 text-[2rem] cursor-pointer text-red-600 z-[12]"
                                onClick={() => setShowStatus(false)}
                            >
                                &times;
                            </button>
                            <video autoPlay muted width="540" height="600" className="z-10" onClick={() => setShowStatus(false)}>
                                <source src={selectedChatInfo.participants.find(participant => participant._id !== userInfo._id)?.statusVideo} type="video/mp4" />
                            </video>
                        </div>
                    )}
                </div>
            </div>
            <GroupModalComponent isOpen={isModalOpen} closeModal={closeModal} />
            <ChatModalComponent isOpen={isChatModalOpen} closeModal={closeChatModal} selectedChatId={selectedChatId} user={userInfo} token={token} fetchAllChats={fetchAllChats} />
        </div>
    );



};

export default HomePage;
